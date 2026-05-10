"use client";

import Image from "next/image";
import bannerimg from "../../../../public/banner2.jpg";
import Logo from "@/components/Logo";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/axiosconfig";

interface PageProps {}

const Page = ({}: PageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axiosInstance.post("/auth/login", {
          email: email,
          password: password,
        });
        console.log(response.data);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        router.push("/home");
      } else {
        if (password !== confirmPassword) {
          setError("Passwords don't match!");
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setError("Password must be at least 8 characters");
          setLoading(false);
          return;
        }

        const response = await axiosInstance.post("/auth/register", {
          email: email,
          password: password,
          full_name: fullName,
        });
        console.log(response.data);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        router.push("/home");
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid credentials");
        } else if (err.response.status === 409) {
          setError("Email already exists");
        } else if (err.response.status === 400) {
          setError("Invalid input data");
        } else {
          setError("An error occurred. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row-reverse h-screen overflow-hidden w-full">
      <div className="w-1/2 flex flex-col items-center justify-center bg-secondary h-screen overflow-y-auto">
        <div className="w-full font-inter max-w-lg px-8 py-8">
          <div className="mb-8">
            <Logo />
            <p className="text-xl font-inter mt-4">
              {isLogin
                ? "Welcome back! Please log in to continue your journey with Traveloop."
                : "Join Traveloop and start your adventure today!"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col">
            {!isLogin && (
              <>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-2 border-muted-foreground/30 focus:border-accent bg-transparent outline-none w-full px-4 py-2 my-4 font-inter text-lg rounded-lg transition-colors"
                  type="text"
                  placeholder="Full Name"
                  required
                />
              </>
            )}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-muted-foreground/30 focus:border-accent bg-transparent outline-none w-full px-4 py-2 my-4 font-inter text-lg rounded-lg transition-colors"
              type="email"
              placeholder="Email Address"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-muted-foreground/30 focus:border-accent bg-transparent outline-none w-full px-4 py-2 my-4 font-inter text-lg rounded-lg transition-colors"
              type="password"
              placeholder="Password"
              required
            />
            {!isLogin && (
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-2 border-muted-foreground/30 focus:border-accent bg-transparent outline-none w-full px-4 py-2 my-4 font-inter text-lg rounded-lg transition-colors"
                type="password"
                placeholder="Confirm Password"
                required
              />
            )}
            <Button
              onClick={() => handleSubmit()}
              size={"lg"}
              disabled={loading}
              className="bg-accent hover:bg-accent/70 cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
            </Button>
          </div>
        </div>
        <div>
          <p className="mt-4 font-inter">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-accent cursor-pointer font-bold"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </span>
          </p>
        </div>
      </div>
      <div className="w-1/2 p-5 rounded-3xl h-screen">
        <Image
          src={bannerimg}
          className="w-full h-full rounded-3xl object-cover"
          alt="login image"
        />
      </div>
    </div>
  );
};

export default Page;
