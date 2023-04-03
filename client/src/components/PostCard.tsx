import React from "react";
import { Post } from "../types";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useAuthState } from "../context/auth";
import axios from "axios";

interface PostCardProps {
  post: Post;
  subMutate?: () => void;
  mutate?: () => void;
}

const PostCard = ({
  post: {
    identifier,
    slug,
    title,
    body,
    subName,
    createdAt,
    voteScore,
    userVote,
    commentCount,
    url,
    username,
    sub,
  },
  mutate,
  subMutate,
}: PostCardProps) => {
  const router = useRouter();
  const isInSubPage = router.pathname === "/subs/[sub]";
  const { authenticated } = useAuthState();

  const vote = async (value: number) => {
    if (!authenticated) router.push("/login");
    if (value === userVote) value = 0;
    try {
      await axios.post("/votes", { identifier, slug, value });
      if (mutate) mutate();
      if (subMutate) subMutate();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex mb-4 bg-white rounded" id={identifier}>
      <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
        {/* Like */}
        <div
          className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
          onClick={() => vote(1)}
        >
          {userVote === 1 ? (
            <FaArrowUp className="text-red-500" />
          ) : (
            <FaArrowUp />
          )}
        </div>
        <p className="text-xs font-bold">{voteScore}</p>
        {/* dislike */}
        <div
          className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
          onClick={() => vote(-1)}
        >
          {userVote === -1 ? (
            <FaArrowDown className="text-blue-500" />
          ) : (
            <FaArrowDown />
          )}
        </div>
      </div>
      {/* post data */}
      <div className="w-full p-2 ">
        {!isInSubPage && (
          <div className="flex items-center">
            <Link legacyBehavior href={`/subs/${subName}`}>
              <a>
                <Image
                  src={sub!.imageUrl}
                  alt="sub"
                  className="rounded-full cursor-pointer"
                  width={12}
                  height={12}
                ></Image>
              </a>
            </Link>
            <Link legacyBehavior href={`/subs/${subName}`}>
              <a className="ml-2 text-xs font-bold cursor-pointer hover:underline">
                {subName}
              </a>
            </Link>
            <span className="mx-1 text-xs text-gray-400"></span>
          </div>
        )}

        <p className="text-xs text-gray-400">
          Posted by
          <Link legacyBehavior href={`/u/${username}`}>
            <a className="mx-1 hover:underline">{username}</a>
          </Link>
          <Link legacyBehavior href={url}>
            <a className="mx-1 hover:underline">
              {dayjs(createdAt).format("YYYY-MM-DD HH:mm")}
            </a>
          </Link>
        </p>
        <Link legacyBehavior href={url}>
          <a className="my-1 text-lg font-medium">{title}</a>
        </Link>
        {body && <p className="my-1 text-sm">{body}</p>}
        <div className="flex">
          <Link legacyBehavior href={url}>
            <a>
              <i className="mr-1 fas fa-comment-alt fa-xs"></i>
              <span>{commentCount}</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
