"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
  alert(error.message);
  return;
}

router.push("/dashboard");
};

  return (
    <main className="min-h-screen bg-green-50 lg:grid lg:grid-cols-2">

      {/* LEFT - LOGIN FORM */}
      <section className="flex min-h-screen items-center justify-left px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
            <div className="mb-6 flex justify-start">
  <Link
    href="/"
    className="rounded-full text-green-600 border-green-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-green-700 hover:text-white"
  >
    Home
  </Link>
</div>
            

          {/* Logo */}
          <div className="mb-10">
            
            <Link href="/" className="text-3xl text-green-900 font-bold tracking-tight">
              BizPulse
            </Link>
       

            <p className="mt-2 text-sm text-green-500">
              Business Intelligence Platform
            </p>
          </div>
         

          

          {/* Heading */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-green-900">
              Welcome back
            </h1>

            <p className="mt-2 text-green-500">
              Sign in to access your business insights.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-8 space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-green-600">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-full border border-green-300 bg-white px-4 py-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-green-600">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-green-600 hover:text-gray-900 hover:none"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-full border border-green-300 bg-white px-4 py-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                required
              />
            </div>

            {/* Sign In */}
            <button
              type="submit"
              className="w-full rounded-full bg-green-900 cursor-pointer py-3 font-medium text-white transition hover:bg-gray-700"
            >
              Sign In
            </button>
          </form>

          {/* Register */}
          <p className="mt-8 text-center text-sm text-green-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-gray-900 hover:none"
            >
              Create account
            </Link>
          </p>

        </div>
      </section>

      {/* RIGHT - IMAGE / BRAND SECTION */}
      <section className="relative hidden min-h-screen overflow-hidden bg-gray-900 lg:flex">

        {/* Image */}
        <img
          src="/login image.jpg"
          alt="Business analytics dashboard"
          className="absolute inset-0 h-full w-full object-cover opacity-100"
        />

      </section>
      
      

    </main>
  );
}