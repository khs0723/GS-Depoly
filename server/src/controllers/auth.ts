import { isEmpty, validate } from "class-validator";
import { Request, Response } from "express";
import User from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const mapError = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {});
};

const me = async (req: Request, res: Response) => {
  return res.json(res.locals.user);
};

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};

    // 이메일과 이름이 이미 있는지 확인
    const email_user = await User.findOneBy({ email });
    const username_uesr = await User.findOneBy({ username });

    // 이미 있다면
    if (email_user) errors.email = "Already exist email";
    if (username_uesr) errors.username = "Already exist username";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password;
    // 엔티티에서 정해놓은 조건으로 유효성 검사
    errors = await validate(user);

    if (errors.length > 0) return res.status(400).json(mapError(errors));

    await user.save();
    return res.json(user);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ e });
  }
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    let errors: any = {};

    if (isEmpty(username)) errors.username = "Username can not be empty";
    if (isEmpty(password)) errors.password = "Password can not be empty";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = await User.findOneBy({ username });
    if (!user)
      return res.status(404).json({ username: "Username does not exist" });

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches)
      return res.status(401).json({ password: "Password is not valid" });

    const token = jwt.sign({ username }, process.env.JWT_SECRET);

    //쿠키저장
    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true, //자바스크립트나 뭐 다른 요인이 쿠키를 조작할수없게함
        maxAge: 60 * 60, // 1hour
        path: "/",
      })
    );
    return res.json({ user, token });
  } catch (e) {
    console.log(e);
    return res.status(500).json(e);
  }
};

const logout = async (req: Request, res: Response) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "prodection",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    })
  );
  res.status(200).json({ success: true });
};

const authControllers = {
  register,
  login,
  me,
  logout,
};

export default authControllers;
