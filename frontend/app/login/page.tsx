"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) router.push("/");
    else setError("Enter your email and password");
  }

  return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <form
            onSubmit={handleSubmit}
            className="w-80 space-y-3 rounded-lg border bg-white p-6"
        >
          <h1 className="text-center text-xl font-semibold">CYBER</h1>
          <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border p-2 text-sm"
          />
          <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border p-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
              type="submit"
              className="w-full rounded bg-black p-2 text-sm text-white"
          >
            Login
          </button>
        </form>
      </main>
  );
}