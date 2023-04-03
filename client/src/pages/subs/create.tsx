import InputGroup from "@/src/components/InputGroup";
import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";

const Create = () => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [errors, setErrors] = useState<any>({});
  let router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const res = await axios.post("/subs", { name, title, desc });

      router.push(`/subs/${res.data.name}`);
    } catch (error: any) {
      console.log(error);
      setErrors(error.response.data);
    }
  };

  return (
    <div className="flex flex-col justify-center pt-16">
      <div className="w-10/12 mx-auto md:w-96 bg-white rounded p-4">
        <h1 className="mb-2 text-lg font-medium">Create Community</h1>
        <hr />
        <form onSubmit={handleSubmit}>
          <div className="my-6">
            <p className="font-medium">Name</p>
            <p className="mb-2 text-xs text-gray-400">
              Coummunity name can not be changed
            </p>
            <InputGroup
              placeholder="Name"
              value={name}
              setValue={setName}
              error={errors.name}
            ></InputGroup>
          </div>

          <div className="my-6">
            <p className="font-medium">Title</p>
            <p className="mb-2 text-xs text-gray-400">Title of the community</p>
            <InputGroup
              placeholder="Title"
              value={title}
              setValue={setTitle}
              error={errors.title}
            ></InputGroup>
          </div>

          <div className="my-6">
            <p className="font-medium">Description</p>
            <p className="mb-2 text-xs text-gray-400">
              Description of the community
            </p>
            <InputGroup
              placeholder="Description"
              value={desc}
              setValue={setDesc}
              error={errors.desc}
            ></InputGroup>
            <div className="flex justify-end ">
              <button className="px-4 py-1 text-sm font-semibold rounded text-white bg-gray-400 border">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;

// 로그인이 안되있다면 로그인 페이지로 리다이렉트 하는함수.
// nextjs는 SSR임. 그래서 이 페이지도 미리 렌더링 함.
// 로그인이 되어있다면 쿠키 또한
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookie = req.headers.cookie;

    if (!cookie) throw new Error("Missing auth token cookie");
    // 쿠키가 있다면
    await axios.get(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/auth/me`, {
      headers: { cookie },
    });
    return { props: {} };
  } catch (error) {
    // 백엔드에서 던져준 쿠키를 이용해 인증 처리 에러면 login 페이지로 고
    res.writeHead(307, { Location: "/login" }).end();

    return { props: {} };
  }
};
