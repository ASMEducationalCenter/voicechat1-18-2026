import React, { useEffect, useState } from "react";

export default function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Check current session
  async function refresh() {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // Register
  async function register() {
    setMsg(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return setMsg(data.error || "Register failed");
    }

    setMsg("Registered successfully. You can now login.");
  }

  // Login (reload ONLY if successful)
  async function login() {
    setMsg(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return setMsg(data.error || "Login failed");
    }

    // ✅ Reload only on successful login
    window.location.reload();
  }

  // Logout (reload ONLY if successful)
  async function logout() {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      window.location.reload();
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4">
      {!user ? (
        <div className="flex flex-col md:flex-row gap-3 w-full items-start md:items-center">
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900">
              Login to Start Interview
            </div>
            <div className="text-xs text-slate-500">
              {msg || "Only approved users may access the mock interview."}
            </div>
          </div>

          <input
            className="border rounded-lg px-3 py-2 text-sm w-full md:w-64"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="border rounded-lg px-3 py-2 text-sm w-full md:w-56"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              className="bg-slate-900 text-white font-bold px-4 py-2 rounded-lg"
              onClick={login}
            >
              Login
            </button>

            <button
              className="bg-slate-100 text-slate-900 font-bold px-4 py-2 rounded-lg"
              onClick={register}
            >
              Register
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Logged in
            </div>
            <div className="text-xs text-slate-500">
              {user.email}
            </div>
          </div>

          <button
            className="text-sm font-semibold text-slate-600 hover:text-red-600"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

