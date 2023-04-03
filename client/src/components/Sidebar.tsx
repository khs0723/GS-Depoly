import Link from "next/link";
import React from "react";
import { useAuthState } from "../context/auth";
import { Sub } from "../types";
import dayjs from "dayjs";

type Props = {
  sub: Sub;
};

const Sidebar = ({ sub }: Props) => {
  const { authenticated } = useAuthState();
  return (
    <div className="hidden w-4/12 ml-3 md:block">
      <div className="bg-white border rounded">
        <div className="p-3 bg-gray-400 rounded-t">
          <p className="font-semibold text-white">About this coummunity</p>
        </div>
        <div className="p-3">
          <p className="mb-3 text-base">{sub?.description}</p>
          <div className="flex mb-3 text-sm font-medium">
            <div className="w-1/2">
              <p>100</p>
              <p>member</p>
            </div>
          </div>
          <p className="my-3">{dayjs(sub?.createdAt).format("MM.DD.YYYY")}</p>

          {authenticated && (
            <div className="mx-0 my-2">
              <Link legacyBehavior href={`/subs/${sub.name}/post`}>
                <a className="w-full p-2 text-sm text-white bg-gray-400 rounded">
                  Create Post
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
