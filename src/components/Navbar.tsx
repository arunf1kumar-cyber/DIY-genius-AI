import React from "react";
import { Cpu, LogOut, User as UserIcon, Sun, Moon } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function Navbar({ user, onLogout, theme, onToggleTheme }: NavbarProps) {
  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand logo */}
        <div className="flex items-center space-x-3 select-none">
          <div className="bg-teal-500 text-slate-900 p-2 rounded-xl shadow-lg shadow-teal-500/10">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="font-sans font-bold tracking-tight text-xl text-white">
              DIY <span className="text-teal-400">Genius</span> AI
            </span>
            <span className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase">
              Intelligent Project Mentor
            </span>
          </div>
        </div>

        {/* Controls Container */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 hover:border-slate-500 text-teal-400 hover:text-teal-300 transition-all cursor-pointer flex items-center justify-center shadow-md"
            title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-teal-400" />
            )}
          </button>

          {/* Auth control panel */}
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <UserIcon className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-slate-200">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-200 border border-slate-700 hover:border-rose-800/50 text-slate-300 text-sm px-4 py-2 rounded-lg transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400">
                ⚡ Guest Mode
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
