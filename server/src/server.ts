import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Routers
import authRoutes from "./routes/auth";
import subRoutes from "./routes/sub";
import postRoutes from "./routes/posts";
import voteRoutes from "./routes/votes";
import userRoutes from "./routes/users";

const app = express();
const origin = process.env.ORIGIN;
app.use(
  cors({
    origin,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.static("public"));

dotenv.config();

app.get("/", (_, res) => res.send("running"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/subs", subRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/users", userRoutes);

let port = 4000;
app.listen(port, async () => {
  console.log(`server start ${process.env.APP_URL}`);

  AppDataSource.initialize()
    .then(async () => {
      console.log("Inserting a new user into the database...");
    })
    .catch((error) => console.log(error));
});
