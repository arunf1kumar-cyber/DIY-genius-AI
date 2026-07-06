import React, { useState } from "react";
import { Mail, Lock, User as UserIcon, Shield, ArrowRight, Activity, Info } from "lucide-react";
import { User } from "../types";

interface AuthModalProps {
  onAuthSuccess: (user: User, token: string) => void;
}

export default function AuthModal({ onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (rememberMe) {
        localStorage.setItem("diy_token", data.token);
      } else {
        sessionStorage.setItem("diy_token", data.token);
      }

      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isLogin ? "Welcome to DIY Genius" : "Create Maker Account"}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isLogin ? "Sign in to access your guided DIY workbench" : "Register to start creating customized smart blueprints"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nikola Tesla"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maker@diygenius.ai"
              className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-teal-500 rounded text-teal-600 bg-slate-950 border-slate-800 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-slate-400 select-none">Remember this device</span>
          </label>
          <span className="text-xs text-slate-500 hover:text-teal-400 cursor-pointer select-none">
            Forgot password?
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/10 cursor-pointer transition-all"
        >
          {loading ? (
            <Activity className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>{isLogin ? "Sign In to Workbench" : "Create My Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-400">
          {isLogin ? "New to DIY Genius AI?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setError(null);
              setIsLogin(!isLogin);
            }}
            className="text-teal-400 hover:text-teal-300 font-bold cursor-pointer"
          >
            {isLogin ? "Create maker account" : "Sign in here"}
          </button>
        </p>
      </div>

      {/* Security note / Educational component */}
      <div className="mt-6 p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-start space-x-3 text-[11px] text-slate-500 font-mono">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-300 font-bold block mb-0.5">🔐 Cyber-Secure Workbench Node</span>
          Credentials are safely hashed on-server using salted <span className="text-slate-300">bcrypt</span> with adaptive work-factors. Session authentication uses cryptographically signed JWT payloads.
        </div>
      </div>
    </div>
  );
}
