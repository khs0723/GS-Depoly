import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../entities/User";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 요청의 쿠키에 담겨있는 토큰 가져오기
    const token = req.cookies.token;
    if (!token) return next();
    console.log("token", token);

    // 토큰 decode
    const { username }: any = jwt.verify(token, process.env.JWT_SECRET);

    // decode 된 토큰에서 유저 이름을 db에서 가져와
    const user = await User.findOneBy({ username });
    console.log("user", user);
    if (!user) throw new Error("Unauthenticated");
    console.log("user middleware user : ", user);
    // 유저 정보를 res.local.user 에 넣어주면 res 에서 언제든 유저 정보를 사용가능.
    res.locals.user = user;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Something wrong" });
  }
};
