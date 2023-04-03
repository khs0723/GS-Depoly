import axios from "axios";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import InputGroup from "../components/InputGroup";
import { useAuthDispatch, useAuthState } from "../context/auth";
import { useRouter } from "next/router";

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});
  const { authenticated } = useAuthState();
  const dispatch = useAuthDispatch();

  if (authenticated) router.push("/");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await axios.post(
        "/auth/login",
        { username, password },
        { withCredentials: true }
      );
      dispatch("LOGIN", res.data?.user);
    } catch (error: any) {
      console.log(error);
      setErrors(error.response.data || {});
    }
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="w-10/12 mx-auto md:w-96">
          <h1 className="mb-2 text-lg font-medium">Login</h1>
          <form onSubmit={handleSubmit}>
            <InputGroup
              placeholder="Username"
              value={username}
              setValue={setUsername}
              error={errors.username}
            />
            <InputGroup
              placeholder="Password"
              value={password}
              setValue={setPassword}
              error={errors.password}
            />

            <button className="w-full py-2 mb-1 text-xs font-bold text-white uppercase bg-gray-400 border border-gray-400 rounded">
              Login
            </button>
          </form>
          <small>
            Create new account
            {/* legacyBehavior 해야 Link 태그 안에 child 가능 */}
            <Link legacyBehavior href="register">
              <a className="ml-1 text-blue-500 uppercase">Register</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
