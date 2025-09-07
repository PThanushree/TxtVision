import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { motion } from "motion/react";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [state, setstate] = useState("Login");
  const { setshowLogin, backendUrl, settoken, setuser } =
    useContext(AppContext);
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (state === "Login") {
        const { data } = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });

        if (data.success) {
          settoken(data.token);
          setuser(data.user);

          localStorage.setItem("token", data.token); //to store in browser local storage
          setshowLogin(false);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });

        if (data.success) {
          settoken(data.token);
          setuser(data.user);

          localStorage.setItem("token", data.token); //to store in browser local storage
          setshowLogin(false);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.log("Error" + error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center">
      <motion.form
        onSubmit={onSubmitHandler}
        initial={{ opacity: 0.2, y: 50 }}
        transition={{ duration: 0.3 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative bg-white p-10 rounded-xl text-slate-500"
      >
        <h1 className="text-center text-2xl text-neutral-700 font-medium">
          {state}
        </h1>
        <p className="text-sm">
          Welcome back! Please {state === "Login" ? "Login" : "Sign up"} to
          continue
        </p>

        {state != "Login" && (
          <div className="border px-6 py-2 flex items-center gap-2 rounded-fulll mt-5">
            <img width={25} src={assets.profile_icon} alt="" />
            <input
              onChange={(e) => setname(e.target.value)}
              value={name}
              className=" outline-none text-sm"
              type="text"
              placeholder="Full Name"
              required
            ></input>
          </div>
        )}

        <div className="border px-6 py-2 flex items-center gap-2 rounded-fulll mt-4">
          <img src={assets.email_icon} alt="" />
          <input
            onChange={(e) => setemail(e.target.value)}
            value={email}
            className=" outline-none text-sm"
            type="email"
            placeholder="Email id"
            required
          ></input>
        </div>

        <div className="border px-6 py-2 flex items-center gap-2 rounded-fulll mt-4">
          <img src={assets.lock_icon} alt="" />
          <input
            onChange={(e) => setpassword(e.target.value)}
            value={password}
            className=" outline-none text-sm"
            type="password"
            placeholder="Password"
            required
          ></input>
        </div>

        <p className="text-sm text-blue-600 my-4 cursor-pointer">
          Forgot Password
        </p>

        <button className="bg-blue-600 w-full text-white py-2 rounded-full">
          {state === "Login" ? "Login" : "Create Account"}
        </button>

        {state === "Login" ? (
          <p className="mt-5 text-center">
            Don't have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => setstate("Sign Up")}
            >
              Sign Up
            </span>
          </p>
        ) : (
          <p className="mt-5 text-center">
            Already have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => setstate("Login")}
            >
              Login
            </span>
          </p>
        )}

        <img
          onClick={() => setshowLogin(false)}
          className="absolute top-5 right-5 cursor-pointer"
          src={assets.cross_icon}
          alt=""
        />
      </motion.form>
    </div>
  );
};

export default Login;

//<div className="absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center">
//this makes login frame appear in middle section while the background remains blur.
