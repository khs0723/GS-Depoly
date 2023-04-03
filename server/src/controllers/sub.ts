import { isEmpty } from "class-validator";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import User from "../entities/User";

import multer, { FileFilterCallback } from "multer";
import { makeId } from "../helper/helpers";
import path from "path";
import { unlinkSync } from "fs";

const createSub = async (req: Request, res: Response, next) => {
  const { name, title, desc } = req.body;

  try {
    // 미들웨어 다 통과 후 sub 이름이 이미 존재 하는지 체크
    let errors: any = {};
    if (isEmpty(name)) errors.name = "Name can not be empty";
    if (isEmpty(title)) errors.title = "Title can not be empty";

    // Querybuilder 를 이용하는 이유는 좀 더 세밀한 작업을 위해서 사용함.
    // findone 사용하여 쉽게 할수 있지만 좀 더 복잡한 sql 문을 위해서 이걸 사용할거임
    const sub = await AppDataSource.getRepository(Sub)
      .createQueryBuilder("sub")
      .where("lower(sub.name) = :name", { name: name.toLowerCase() })
      .getOne();

    if (sub) errors.name = "Community already exists";

    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something wrong ??" });
  }

  try {
    const user: User = res.locals.user;
    console.log("user sub create", user);
    const sub = new Sub();
    sub.name = name;
    sub.title = title;
    sub.description = desc;
    sub.user = user;

    await sub.save();
    return res.json(sub);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something wrong" });
  }
};

const topSubs = async (req: Request, res: Response) => {
  try {
    console.log("top sub start?");
    const imageUrl = `COALESCE( '${process.env.APP_URL}/images/' ||s."imageUrn", 'https://www.gravatar.com/avatar?d=mp&f=y')`;
    const subs = await AppDataSource.createQueryBuilder()
      .select(
        `s.title, s.name, ${imageUrl} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Sub, "s")
      .leftJoin(Post, "p", `s.name = p."subName"`)
      .groupBy('s.title, s.name, "imageUrl"')
      .orderBy(`"postCount"`, "DESC")
      .limit(5)
      .execute();
    console.log(subs);
    return res.json(subs);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something wrong in topsub" });
  }
};

const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const sub = await Sub.findOneByOrFail({ name });
    console.log("sub", sub);
    // post 가 있다면 포스트까지 가져오는 부분
    const posts = await Post.find({
      where: { subName: sub.name },
      order: { createdAt: "DESC" },
      relations: ["comments", "votes"],
    });

    sub.posts = posts;
    if (res.locals.user) {
      sub.posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(sub);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: "Can not find community" });
  }
};

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

    if (sub.username !== user.username) {
      return res
        .status(403)
        .json({ error: "너는 이 커뮤니티의 주인이 아니여" });
    }
    res.locals.sub = sub;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제발생" });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: "public/images",
    filename: (_, file, callback) => {
      // 유니크아이디
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname));
    },
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      callback(null, true);
    } else {
      callback(new Error("This is not image"));
    }
  },
});

const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;
  try {
    const type = req.body.type;
    // 만약 파일 유형을 가져오지 않았다면 업로드 된 파일 삭제
    if (type !== "image" && type !== "banner") {
      if (!req.file?.path) {
        return res.status(400).json({ error: "유효하지않은 파일 형식" });
      }

      // 파일 지우기
      unlinkSync(req.file.path);
      return res.status(400).json({ error: "유효하지 않은 파일 형식" });
    }

    let oldImageUrn: string = "";

    if (type === "image") {
      oldImageUrn = sub.imageUrn || "";
      sub.imageUrn = req.file.filename || "";
    } else if (type === "banner") {
      oldImageUrn = sub.bannerUrn || "";
      sub.bannerUrn = req.file.filename || "";
    }

    await sub.save();

    // 전에 있던 이미지 로컬에서 삭제
    if (oldImageUrn !== "") {
      const fullFileName = path.resolve(
        process.cwd(),
        "public",
        "images",
        oldImageUrn
      );
      unlinkSync(fullFileName);
    }

    return res.json(sub);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Image upload error" });
  }
};

const subControllers = {
  createSub,
  topSubs,
  getSub,
  ownSub,
  upload,
  uploadSubImage,
};

export default subControllers;
