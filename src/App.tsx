import React, { useState, useEffect } from "react";
import { Cpu, Plus, Sparkles, Loader2, RefreshCw } from "lucide-react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import ProjectCreator from "./components/ProjectCreator";
import ProjectDetail from "./components/ProjectDetail";
import { Project, User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [presetGenerating, setPresetGenerating] = useState(false);

  // Theme support
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("diy_theme");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("diy_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Auto load session on mount
  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem("diy_token") || sessionStorage.getItem("diy_token");
      if (storedToken) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const data = await res.json();
          if (res.ok) {
            setUser(data.user);
            setToken(storedToken);
            await loadProjects(storedToken);
          } else {
            // Clean up invalid session
            localStorage.removeItem("diy_token");
            sessionStorage.removeItem("diy_token");
          }
        } catch (err) {
          console.error("Session verification failed:", err);
        }
      }
      setLoading(false);
    }
    verifySession();
  }, []);

  async function loadProjects(jwtToken: string) {
    try {
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }

  function handleAuthSuccess(verifiedUser: User, jwtToken: string) {
    setUser(verifiedUser);
    setToken(jwtToken);
    loadProjects(jwtToken);
  }

  function handleLogout() {
    localStorage.removeItem("diy_token");
    sessionStorage.removeItem("diy_token");
    setUser(null);
    setToken(null);
    setProjects([]);
    setSelectedProjectId(null);
    setShowCreator(false);
  }

  // Handle preset starter idea selection
  async function handleSelectPresetIdea(idea: { title: string; category: string; experience: string }) {
    if (!token) return;
    setPresetGenerating(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: idea.title,
          category: idea.category,
          experience: idea.experience,
          budget: "Standard ($50 - $100)",
          tools: "Basic screwdrivers, soldering iron, wire cutters",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate DIY blueprint");
      }

      setProjects((prev) => [data, ...prev]);
      setSelectedProjectId(data.id);
    } catch (err) {
      console.error("Failed to auto generate preset idea:", err);
      alert("Failed to initialize this preset. Try creating it with custom configs.");
    } finally {
      setPresetGenerating(false);
    }
  }

  async function handleDeleteProject(projectId: string) {
    if (!token) return;
    if (!confirm("Are you sure you want to permanently delete this guided DIY project?")) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        if (selectedProjectId === projectId) {
          setSelectedProjectId(null);
        }
      } else {
        alert("Could not delete project. Please try again.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleUpdateProject(updatedProject: Project) {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-custom text-white flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
        <span className="text-sm font-mono text-slate-400">Loading DIY Genius node...</span>
      </div>
    );
  }

  if (presetGenerating) {
    return (
      <div className="min-h-screen bg-bg-custom text-white flex flex-col items-center justify-center p-12 text-center max-w-2xl mx-auto space-y-6">
        <div className="relative">
          <Loader2 className="w-14 h-14 text-teal-400 animate-spin" />
          <Cpu className="w-6 h-6 text-teal-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Compiling Preset Curriculum...</h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
            Our AI project coordinator is building your customized Bill of Materials, safety regulations, step list, and pinout schematics. This will take a brief moment.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-teal-500 bg-teal-500/5 px-4 py-2 rounded-lg border border-teal-500/10 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Configuring step procedures & connections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-custom text-slate-200 flex flex-col font-sans">
      <Navbar user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {!user ? (
          <div className="py-12 md:py-20 flex justify-center">
            <AuthModal onAuthSuccess={handleAuthSuccess} />
          </div>
        ) : showCreator ? (
          <ProjectCreator
            token={token || ""}
            onProjectCreated={(newProj) => {
              setProjects((prev) => [newProj, ...prev]);
              setSelectedProjectId(newProj.id);
              setShowCreator(false);
            }}
            onCancel={() => setShowCreator(false)}
          />
        ) : selectedProject ? (
          <ProjectDetail
            token={token || ""}
            project={selectedProject}
            onBack={() => setSelectedProjectId(null)}
            onUpdateProject={handleUpdateProject}
          />
        ) : (
          <Dashboard
            user={user}
            projects={projects}
            onSelectProject={(id) => setSelectedProjectId(id)}
            onStartNewProject={() => setShowCreator(true)}
            onDeleteProject={handleDeleteProject}
            onSelectPresetIdea={handleSelectPresetIdea}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500 font-mono select-none print:hidden">
        <p>© 2026 DIY Genius AI • Full-Stack Intelligent Maker Mentor</p>
        <p className="text-[10px] text-slate-600 mt-1">
          Designed for STEM learning, visual diagnostics, and circuit engineering. Powered by Gemini.
        </p>
      </footer>
    </div>
  );
}
