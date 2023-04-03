import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import useSWR from "swr";
import { Post, Sub } from "../types";
import axios from "axios";
import { useAuthState } from "../context/auth";
import useSWRInfinite from "swr/infinite";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";

export default function Home() {
  const { authenticated } = useAuthState();
  const fetcher = async (url: string) => {
    return await axios.get(url).then((res) => res.data);
  };
  const address = "/subs/sub/topSubs";

  const getKey = (pageIndex: number, previousePageData: Post[]) => {
    if (previousePageData && !previousePageData.length) return null;
    return `/posts?page=${pageIndex}`;
  };

  const {
    data,
    error,
    size: page,
    setSize: setPage,
    isValidating,
    mutate,
  } = useSWRInfinite<Post[]>(getKey);
  const isLoading = !data && !error;
  const posts: Post[] = data ? ([] as Post[]).concat(...data) : [];

  const { data: topSubs } = useSWR<Sub[]>(address, fetcher);

  const [observedPost, setObervedPost] = useState("");

  useEffect(() => {
    if (!posts || posts.length === 0) return;
    // post 배열의 마지막 post id 가져오기
    const id = posts[posts.length - 1].identifier;
    // posts 배열에 포스트가 추가되서 마지막 포스트가 바뀐다면
    // 바뀐 포스트 중 마지막 포스트를 observed로 교체
    if (id !== observedPost) {
      setObervedPost(id);
      observeElement(document.getElementById(id));
    }
  }, [posts]);

  const observeElement = (element: HTMLElement | null) => {
    if (!element) return;
    // viewport 와 설정한 element의 교차점
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting === true) {
          console.log("lage post");
          setPage(page + 1);
          observer.unobserve(element);
        }
      },
      { threshold: 1 }
    );
    observer.observe(element);
  };

  console.log("@@@@@@@@", posts);

  return (
    <div className="flex max-w-5xl px-4 pt-5 mx-auto">
      {/* post list */}
      <div className="w-full md:mr-3 md:w-8/12">
        {isLoading && <p className="text-lg text-center">Loading...</p>}
        {posts?.map((post) => (
          <PostCard key={post.identifier} post={post} mutate={mutate} />
        ))}
      </div>
      {/* Side bar */}
      <div className="hidden w-4/12 ml-3 md:block">
        <div className="bg-white border rounded">
          <div className="p-4 border-b">
            <p className="text-lg font-semibold text-center ">Top Community</p>
          </div>
          {/* community list */}
          <div>
            {topSubs?.map((sub) => (
              <div
                key={sub.name}
                className="flex items-center px-4 py-2 text-xs border.b"
              >
                <Link legacyBehavior href={`/subs/${sub.name}`}>
                  <a>
                    <Image
                      src={sub.imageUrl}
                      className="rounded-full cursor-pointer"
                      alt="sub"
                      width={24}
                      height={24}
                    />
                  </a>
                </Link>
                <Link legacyBehavior href={`/subs/${sub.name}`}>
                  <a className="ml-2 font-bold hover:cursor-pointer">
                    {sub.name}
                  </a>
                </Link>
                <p className="ml-auto font-md">{sub.postCount}</p>
              </div>
            ))}
          </div>
          {authenticated && (
            <div className="w-full py-6 text-center">
              <Link legacyBehavior href="/subs/create">
                <a className="w-full p-2 text-center text-white bg-gray-400 rounded">
                  {" "}
                  Create Community
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
