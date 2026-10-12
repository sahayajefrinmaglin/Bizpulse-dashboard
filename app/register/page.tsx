"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        company_name: company,
      },
    },
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Account created successfully!");

  console.log(data);
};

  return (
    <main className="min-h-screen bg-green-50 lg:grid lg:grid-cols-2">

      {/* LEFT - REGISTER FORM */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
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
            <Link
              href="/"
              className="text-3xl font-bold tracking-tight text-green-900"
            >
              BizPulse
            </Link>

            <p className="mt-2 text-sm text-green-500">
              Business Intelligence Platform
            </p>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-green-900">
              Create your account
            </h1>

            <p className="mt-2 text-green-500">
              Start managing your business analytics with BizPulse.
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="mt-8 space-y-5">

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-green-600">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-full border border-green-300 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>
            {/* Company Name */}
<div>
  <label className="text-sm font-medium text-green-600">
    Company Name
  </label>

  <input
    type="text"
    placeholder="Your company"
    value={company}
    onChange={(e) => setCompany(e.target.value)}
    className="mt-2 w-full rounded-full border border-green-300 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
    required
  />
</div>

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
                className="mt-2 w-full rounded-full border border-green-300 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-green-600">
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-full border border-green-300 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-green-900 cursor-pointer py-3 font-medium text-white transition hover:bg-gray-700"
            >
              Create Account
            </button>

          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-green-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-gray-600 cursor hover:none"
            >
              Sign in
            </Link>
          </p>

        </div>
      </section>

      {/* RIGHT - IMAGE SECTION */}
      <section className="relative hidden min-h-screen overflow-hidden bg-gray-900 lg:flex">

        <img
          src="/register image.jpg"
          alt="Business analytics dashboard"
          className="absolute inset-0 h-full w-full object-cover opacity-100"
        />

        {/* Dark overlay */}
       
        {/* Right side content */}
       

      </section>

    </main>
  );
}