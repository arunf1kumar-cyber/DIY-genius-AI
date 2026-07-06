import React, { useState } from "react";
import { Sparkles, Hammer, Cpu, Layout, Battery, Lightbulb, HeartHandshake, Loader2 } from "lucide-react";

interface ProjectCreatorProps {
  token: string;
  onProjectCreated: (project: any) => void;
  onCancel: () => void;
}

const POPULAR_CATEGORIES = [
  { name: "Electronics", icon: Cpu, color: "text-blue-400 bg-blue-400/10 border-blue-500/20" },
  { name: "Arduino / ESP32", icon: Sparkles, color: "text-teal-400 bg-teal-400/10 border-teal-500/20" },
  { name: "Home Automation", icon: Layout, color: "text-orange-400 bg-orange-400/10 border-orange-500/20" },
  { name: "Robotics & IoT", icon: Hammer, color: "text-purple-400 bg-purple-400/10 border-purple-500/20" },
  { name: "Power & Solar", icon: Battery, color: "text-amber-400 bg-amber-400/10 border-amber-500/20" },
  { name: "STEM / School", icon: Lightbulb, color: "text-rose-400 bg-rose-400/10 border-rose-500/20" },
];

export default function ProjectCreator({ token, onProjectCreated, onCancel }: ProjectCreatorProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [experience, setExperience] = useState("beginner");
  const [budget, setBudget] = useState("Standard ($50 - $100)");
  const [tools, setTools] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          experience,
          budget,
          tools: tools.trim() || "None (Beginner layout)",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate DIY project guide");
      }

      onProjectCreated(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while generating the blueprint.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-12 text-center flex flex-col items-center justify-center min-h-[450px]">
        <div className="relative mb-6">
          <Loader2 className="w-14 h-14 text-teal-400 animate-spin" />
          <Cpu className="w-6 h-6 text-teal-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Synthesizing Project Blueprint...</h3>
        <p className="text-slate-400 text-sm max-w-md">
          Gemini is acting as your expert mentor. It is compiling customized step-by-step assembly guides, Bill of Materials pricing, safety precautions, and precise wiring connections specifically matched to your experience level.
        </p>
        <div className="mt-8 flex items-center space-x-2 text-xs font-mono text-teal-500/70 bg-teal-500/5 px-4 py-2 rounded-lg border border-teal-500/10 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Analyzing components & safety guidelines...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Custom AI Project</h2>
          <p className="text-slate-400 text-sm mt-1">
            Specify your project vision, and our AI mentor will prepare a customized curriculum.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-white text-sm bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-lg border border-slate-700/50 transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project title */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-200">What do you want to build?</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Smart Wi-Fi Plant Watering System, Custom Bluetooth Speaker"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
          />
        </div>

        {/* Project Category */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Category Selection</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {POPULAR_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-teal-500 bg-teal-500/10 text-white"
                      : "border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experience level */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">My Experience Level</label>
            <div className="grid grid-cols-3 gap-2">
              {["beginner", "intermediate", "advanced"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setExperience(lvl)}
                  className={`py-2 px-3 text-xs capitalize rounded-lg font-bold border transition-all cursor-pointer ${
                    experience === lvl
                      ? "border-teal-500 bg-teal-500/15 text-teal-300 font-bold"
                      : "border-slate-800 bg-slate-950/50 hover:bg-slate-950 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              AI adapts difficulty, complexity of wiring guides, and instruction language.
            </p>
          </div>

          {/* Budget allocation */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Target Budget Allocation</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-lg text-slate-200 text-xs outline-none transition-all cursor-pointer"
            >
              <option>Ultra Low-Cost (Under $20)</option>
              <option>Standard ($50 - $100)</option>
              <option>Premium Creator ($100 - $200)</option>
              <option>Enterprise / Advanced ($200+)</option>
            </select>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              AI will prioritize components that fit this total price boundary.
            </p>
          </div>
        </div>

        {/* Existing tools */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
            <span>Tools I Already Have (Optional)</span>
            <span className="text-[10px] text-slate-500 font-mono uppercase">separated by commas</span>
          </label>
          <input
            type="text"
            value={tools}
            onChange={(e) => setTools(e.target.value)}
            placeholder="e.g. Soldering iron, hot glue gun, wire cutters, multimeter"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-slate-200 placeholder-slate-600 text-sm outline-none transition-all"
          />
        </div>

        {/* Safe advice warning footer */}
        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start space-x-3 text-xs text-amber-300">
          <HeartHandshake className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Safety & Educational Integrity Guaranteed</span>
            DIY Genius AI strictly screens created blueprints to ensure electrical limits, battery regulations, thermal standards, and physical hazards are flagged appropriately.
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/10 cursor-pointer transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span>Launch AI Project Mentor</span>
        </button>
      </form>
    </div>
  );
}
