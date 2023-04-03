import { Request, Response } from "express";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import Comment from "../entities/Comment";

const createPost = async (req: Request, res: Response) => {
  const { title, body, subName } = req.body;
  if (title.trim() === "") {
    return res.status(400).json({ title: "Title can not be empty" });
  }

  const user = res.locals.user;
  try {
    const sub = await Sub.findOneByOrFail({ name: subName });
    const post = new Post();
    post.title = title;
    post.body = body;
    post.user = user;
    post.sub = sub;

    await post.save();
    console.log(post);
    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Can not create post" });
  }
};

const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  try {
    const post = await Post.findOneOrFail({
      where: { identifier, slug },
      relations: ["sub", "votes"],
    });
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", post);
    if (res.locals.user) {
      post.setUserVote(res.locals.user);
    }

    return res.send(post);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: "can not find post" });
  }
};

const createComment = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const body = req.body.body;

  try {
    const post = await Post.findOneByOrFail({ identifier, slug });
    const comment = new Comment();
    comment.body = body;
    comment.user = res.locals.user;
    comment.post = post;

    if (res.locals.user) {
      post.setUserVote(res.locals.user);
    }

    await comment.save();
    return res.json(comment);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: "Can not found post" });
  }
};
const getComments = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  try {
    const post = await Post.findOneByOrFail({ identifier, slug });
    const comments = await Comment.find({
      where: { postId: post.id },
      order: { createdAt: "DESC" },
      relations: ["votes"],
    });
    if (res.locals.user) {
      comments.forEach((c) => c.setUserVote(res.locals.user));
    }
    return res.json(comments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something wrong" });
  }
};

const getPosts = async (req: Request, res: Response) => {
  const currentPage: number = (req.query.page || 0) as number;
  const perPage: number = (req.query.count || 7) as number;

  try {
    const posts = await Post.find({
      order: { createdAt: "DESC" },
      relations: ["sub", "votes", "comments"],
      skip: currentPage * perPage,
      take: perPage,
    });

    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "soemthing wrong" });
  }
};

const postControllers = {
  createPost,
  getPost,
  createComment,
  getComments,
  getPosts,
};

export default postControllers;
