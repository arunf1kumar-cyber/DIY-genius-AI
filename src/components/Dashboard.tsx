import React from "react";
import { Plus, Cpu, Layers, Trophy, FileImage, ShieldAlert, Sparkles, Trash2, ArrowRight } from "lucide-react";
import { Project, User } from "../types";

interface DashboardProps {
  user: User;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onStartNewProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onSelectPresetIdea: (idea: { title: string; category: string; experience: string }) => void;
}

const PRESET_IDEAS = [
  {
    title: "ESP32 Web Server Weather Station",
    category: "Arduino / ESP32",
    experience: "beginner",
    description: "Monitor room temperature, humidity, and atmospheric pressure directly via a stylish browser portal.",
    difficulty: "Beginner",
  },
  {
    title: "Obstacle Avoidance Robot Chassis",
    category: "Robotics & IoT",
    experience: "intermediate",
    description: "Build a smart 2WD/4WD rover with ultrasonic sensors and Arduino motor controllers.",
    difficulty: "Intermediate",
  },
  {
    title: "Automated Solar Battery Charger Manager",
    category: "Power & Solar",
    experience: "advanced",
    description: "Regulate 12V lead-acid or Li-ion charge cycles using custom buck converter mechanics.",
    difficulty: "Advanced",
  },
];

export default function Dashboard({
  user,
  projects,
  onSelectProject,
  onStartNewProject,
  onDeleteProject,
  onSelectPresetIdea,
}: DashboardProps) {
  const activeProjectsCount = projects.filter((p) => !p.completed).length;
  const completedProjectsCount = projects.filter((p) => p.completed).length;
  const totalBudgetSpent = projects.reduce((acc, p) => acc + (p.budget?.estimatedTotal || 0), 0);
  const totalUploadedImages = projects.reduce((acc, p) => acc + (p.uploadedImages?.length || 0), 0);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900/40 via-slate-900 to-slate-900 border border-teal-500/20 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-teal-400/10 text-teal-300 border border-teal-500/20 px-3 py-1 rounded-full text-xs font-mono mb-4">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Maker Level: Enthusiast ({projects.length} blueprints)</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-teal-400">{user.name}</span>!
          </h1>
          <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Ready to craft something incredible today? View your customized project progress trackers, troubleshoot active wiring schematics, or initiate a brand-new AI mentoring session.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onStartNewProject}
              className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-teal-500/10"
            >
              <Plus className="w-5 h-5" />
              <span>New AI Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/15">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-slate-500 text-[11px] font-mono uppercase tracking-wider">Active DIYs</span>
            <span className="text-xl font-bold text-white">{activeProjectsCount}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/15">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-slate-500 text-[11px] font-mono uppercase tracking-wider">Completed</span>
            <span className="text-xl font-bold text-white">{completedProjectsCount}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-slate-500 text-[11px] font-mono uppercase tracking-wider">BOM Budget</span>
            <span className="text-xl font-bold text-white">${totalBudgetSpent}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/15">
            <FileImage className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-slate-500 text-[11px] font-mono uppercase tracking-wider">AI Verifications</span>
            <span className="text-xl font-bold text-white">{totalUploadedImages}</span>
          </div>
        </div>
      </div>

      {/* Recommended Starter Ideas */}
      <div>
        <div className="flex items-center space-x-2.5 mb-5">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Recommended Preset Maker Ideas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRESET_IDEAS.map((idea) => (
            <div
              key={idea.title}
              className="bg-slate-900 border border-slate-800/80 hover:border-teal-500/30 rounded-xl p-5 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-400/5 px-2 py-0.5 rounded border border-teal-500/10 uppercase">
                    {idea.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{idea.difficulty}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                  {idea.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {idea.description}
                </p>
              </div>
              <button
                onClick={() => onSelectPresetIdea(idea)}
                className="mt-5 w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                <span>Generate Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* User's Project Blueprint List */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white tracking-tight">My Custom Guided Projects</h2>
          {projects.length > 0 && (
            <button
              onClick={onStartNewProject}
              className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Guide</span>
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-12 text-center max-w-lg mx-auto">
            <Cpu className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-1">No custom blueprints active</h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
              You haven't initialized any DIY projects yet. Select one of the recommended templates above, or click the "New AI Project" button to define your custom concept.
            </p>
            <button
              onClick={onStartNewProject}
              className="mt-5 inline-flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-teal-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Guide</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project) => {
              const totalSteps = project.steps?.length || 1;
              const currentStepIndex = project.currentStep;
              // Percent of steps marked completed
              const completedCount = project.steps?.filter((s) => s.completed).length || 0;
              const percent = Math.round((completedCount / totalSteps) * 100);

              return (
                <div
                  key={project.id}
                  className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/60 rounded-xl p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        {project.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            project.difficulty === "beginner"
                              ? "bg-teal-500/10 text-teal-400"
                              : project.difficulty === "intermediate"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {project.difficulty}
                        </span>
                        {project.completed && (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded uppercase">
                            Done
                          </span>
                        )}
                      </div>
                    </div>

                    <h3
                      onClick={() => onSelectProject(project.id)}
                      className="text-base font-bold text-white hover:text-teal-400 transition-colors cursor-pointer"
                    >
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Progress details */}
                    <div className="mt-5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Step {currentStepIndex + 1} of {totalSteps}</span>
                        <span className="text-teal-400 font-bold">{percent}% complete</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-teal-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-5 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                    <button
                      onClick={() => onSelectProject(project.id)}
                      className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Enter Workbench</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      className="p-1.5 rounded-lg bg-slate-950 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/15 transition-all cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
