import React, { useState, useEffect } from "react";
import {
  ListChecks,
  Cpu,
  Calculator,
  ShieldAlert,
  FileText,
  Clock,
  ArrowLeft,
  ChevronRight,
  Info,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Lock,
  Check,
} from "lucide-react";
import { Project } from "../types";
import ProjectMentorChat from "./ProjectMentorChat";
import VisualDiagnostic from "./VisualDiagnostic";
import VideoRecommendations from "./VideoRecommendations";
import ReportGenerator from "./ReportGenerator";

interface ProjectDetailProps {
  token: string;
  project: Project;
  onBack: () => void;
  onUpdateProject: (updatedProject: Project) => void;
}

type TabType = "steps" | "circuit" | "bom" | "safety" | "report";

export default function ProjectDetail({
  token,
  project,
  onBack,
  onUpdateProject,
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("steps");
  const [loadingCompleteStep, setLoadingCompleteStep] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

  const totalSteps = project.steps?.length || 0;
  const currentStepIndex = project.currentStep;
  
  // Keep the viewed step synchronized when user completes a step and page advances
  useEffect(() => {
    setSelectedStepIndex(project.currentStep);
  }, [project.currentStep]);

  const activeStepIndex = selectedStepIndex !== null ? selectedStepIndex : currentStepIndex;
  const activeStep = project.steps?.[activeStepIndex] || null;

  async function handleMarkStepComplete() {
    if (loadingCompleteStep) return;
    setLoadingCompleteStep(true);

    try {
      const response = await fetch(`/api/projects/${project.id}/step-complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updated = await response.json();
      if (!response.ok) {
        throw new Error(updated.error || "Failed to update step progress");
      }

      onUpdateProject(updated);
    } catch (err) {
      console.error(err);
      alert("Error saving step progress. Please try again.");
    } finally {
      setLoadingCompleteStep(false);
    }
  }

  // Handle chat updating
  function handleChatUpdate(newHistory: any[]) {
    onUpdateProject({
      ...project,
      chatHistory: newHistory,
    });
  }

  // Handle visual upload updating
  function handleImageAnalysisUpdate(updatedProject: any) {
    onUpdateProject(updatedProject);
  }

  return (
    <div className="space-y-6 animate-fade-in print:bg-white print:text-black">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 print:hidden">
        <div className="flex items-start space-x-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-teal-400 bg-teal-400/5 px-2 py-0.5 rounded border border-teal-500/10 uppercase">
                {project.category}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                {project.difficulty} Level
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-1">{project.title}</h1>
          </div>
        </div>

        {/* Dynamic Progress Bar Header */}
        <div className="flex items-center space-x-4 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl shrink-0">
          <div className="text-right">
            <span className="block text-[10px] font-mono text-slate-500 uppercase">Project Progress</span>
            <span className="text-sm font-bold text-white">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
          </div>
          <div className="w-24 bg-slate-950 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/60 pb-3 print:hidden">
        {[
          { id: "steps", label: "Guided Steps", icon: ListChecks },
          { id: "circuit", label: "Circuit Connectivity", icon: Cpu },
          { id: "bom", label: "BOM & Budget", icon: Calculator },
          { id: "safety", label: "Safety Guide", icon: ShieldAlert },
          { id: "report", label: "Report Generator", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 py-2 px-4 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                isActive
                  ? "bg-teal-500/10 border-teal-500/30 text-teal-300"
                  : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Workspace Bento layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left main workspace content */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB: Steps */}
          {activeTab === "steps" && activeStep && (
            <div className="space-y-6">
              {/* Stepper Timeline Navigation Map */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                      Interactive Project Roadmap
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Navigate Step 1 to Step {totalSteps} seamlessly. Click any step to inspect instructions ahead.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-400/5 px-2 py-0.5 rounded border border-teal-500/10">
                    Active Assembly: Step {currentStepIndex + 1}
                  </span>
                </div>

                {/* Horizontal scrollable timeline track */}
                <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {project.steps.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    const isSelected = idx === activeStepIndex;
                    const isFuture = idx > currentStepIndex;

                    return (
                      <button
                        key={step.stepNumber}
                        onClick={() => setSelectedStepIndex(idx)}
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-500/10 border-teal-500/60 text-teal-300 ring-1 ring-teal-500/20"
                            : isCompleted
                            ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-400 hover:border-emerald-500/30"
                            : isActive
                            ? "bg-slate-900 border-teal-500/20 text-white hover:border-teal-500/40"
                            : "bg-slate-900/30 border-slate-800/80 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                        }`}
                      >
                        {/* Circle Badge Indicator */}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                            isSelected
                              ? "bg-teal-400 text-slate-950"
                              : isCompleted
                              ? "bg-emerald-500 text-slate-950"
                              : isActive
                              ? "bg-slate-800 text-teal-400 ring-2 ring-teal-400/20 animate-pulse"
                              : "bg-slate-950 text-slate-600 border border-slate-800"
                          }`}
                        >
                          {isCompleted ? "✓" : step.stepNumber}
                        </div>
                        <div className="text-left leading-tight pr-1">
                          <span className="block text-[8px] font-mono uppercase tracking-wider opacity-60">
                            {isCompleted ? "Complete" : isActive ? "Active" : "Preview"}
                          </span>
                          <span className="text-[11px] font-bold block max-w-[110px] truncate">
                            {step.objective}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Return to Active build alert if they navigated away */}
                {activeStepIndex !== currentStepIndex && (
                  <div className="flex items-center justify-between p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[11px] text-amber-300 animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Viewing Step {activeStepIndex + 1} ({activeStepIndex < currentStepIndex ? "Reviewing completed task" : "Previewing upcoming task"}).
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedStepIndex(currentStepIndex)}
                      className="text-teal-400 hover:text-teal-300 font-bold underline cursor-pointer"
                    >
                      Return to Active Step
                    </button>
                  </div>
                )}
              </div>

              {/* Main Step Details Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                  <div>
                    <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider block">
                      {activeStepIndex === currentStepIndex ? "Active Build Step" : `Step ${activeStepIndex + 1} details`}
                    </span>
                    <h2 className="text-lg font-bold text-white mt-1">{activeStep.objective}</h2>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Est. Time: {activeStep.estimatedTime}</span>
                  </div>
                </div>

                {/* Step detail body */}
                <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Actionable Guide & Instructions
                    </h3>
                    <p className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4 text-slate-200">
                      {activeStep.explanation}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Required items */}
                    <div className="p-4 bg-slate-950/40 border border-slate-800/50 rounded-xl space-y-2">
                      <span className="font-bold text-xs text-white block">Required components:</span>
                      <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                        {activeStep.components.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Required tools */}
                    <div className="p-4 bg-slate-950/40 border border-slate-800/50 rounded-xl space-y-2">
                      <span className="font-bold text-xs text-white block">Required tools:</span>
                      <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                        {activeStep.tools.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Expected outcomes */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-200 block mb-1">Expected Outcome:</strong>
                      {activeStep.expectedResult}
                    </div>
                  </div>

                  {/* Common mistakes */}
                  {activeStep.commonMistakes && activeStep.commonMistakes.length > 0 && (
                    <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start space-x-3 text-xs text-rose-300">
                      <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-rose-200 block mb-1">Common Mistakes to Avoid:</strong>
                        <ul className="list-disc pl-4 space-y-1">
                          {activeStep.commonMistakes.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Mentor tips */}
                  {activeStep.tips && activeStep.tips.length > 0 && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start space-x-3 text-xs text-amber-300">
                      <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-200 block mb-1">Mentor Assembly Tips:</strong>
                        <ul className="list-disc pl-4 space-y-1">
                          {activeStep.tips.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active step picture upload visualizer if they verified it */}
                {activeStep.imageUrl && (
                  <div className="border border-slate-800 rounded-xl overflow-hidden p-4 bg-slate-950/40">
                    <span className="text-[10px] font-mono text-teal-400 block mb-2 uppercase">Uploaded Build Photo:</span>
                    <img
                      src={activeStep.imageUrl}
                      alt="Current step assembly"
                      referrerPolicy="no-referrer"
                      className="max-h-[220px] rounded-lg border border-slate-800 object-cover"
                    />
                    {activeStep.verificationFeedback && (
                      <p className="text-xs text-slate-400 font-mono mt-3 whitespace-pre-wrap border-t border-slate-800/80 pt-3">
                        {activeStep.verificationFeedback}
                      </p>
                    )}
                  </div>
                )}

                {/* Step verification controller */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-400 text-center sm:text-left">
                    {activeStepIndex === currentStepIndex ? (
                      "Are you ready to move to the next step? Ensure connections match recommendations."
                    ) : activeStepIndex < currentStepIndex ? (
                      "This task step has been successfully completed and registered."
                    ) : (
                      "This is a preview step. Follow preceding tasks to compile active builds."
                    )}
                  </p>
                  {activeStepIndex === currentStepIndex ? (
                    <button
                      onClick={handleMarkStepComplete}
                      disabled={loadingCompleteStep}
                      className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/30 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all shrink-0"
                    >
                      <span>Mark Step Complete</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : activeStepIndex < currentStepIndex ? (
                    <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-xs font-bold font-mono">
                      <Check className="w-4 h-4" />
                      <span>Step Completed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedStepIndex(currentStepIndex)}
                      className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Unlock with Active Step {currentStepIndex + 1}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Circuit */}
          {activeTab === "circuit" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Circuit Connectivity Mapping</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Beginner-friendly point-to-point electrical pin layouts. Avoid guessing wires!
                </p>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {project.circuitDetails.overview}
              </p>

              {/* Explicit Connection pin layout */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                  Explicit Pin Connection Schedule
                </span>
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                        <th className="p-3">From Pin / Component</th>
                        <th className="p-3">To Pin / Controller</th>
                        <th className="p-3">Pin Label</th>
                        <th className="p-3">Wiring Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {project.circuitDetails.connections.map((conn, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/20 text-slate-300">
                          <td className="p-3 font-semibold text-slate-200">{conn.from}</td>
                          <td className="p-3 font-semibold text-slate-200">{conn.to}</td>
                          <td className="p-3 font-mono text-teal-400">{conn.pinLabel || "N/A"}</td>
                          <td className="p-3 text-slate-400">{conn.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Current flow and Mistakes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-xs text-white block">Current Flow Explanation:</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {project.circuitDetails.currentFlowExplanation}
                  </p>
                </div>
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-2 text-rose-300">
                  <span className="font-bold text-xs text-rose-200 block">Critical Wiring Mistakes:</span>
                  <ul className="text-xs list-disc pl-4 space-y-1">
                    {project.circuitDetails.wiringMistakes.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BOM & Budget */}
          {activeTab === "bom" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Bill of Materials (BOM)</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Customized item pricing breakdown. Total cost represents the standard components layout.
                  </p>
                </div>
                <div className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3.5 py-2 rounded-xl text-xs font-mono text-right shrink-0">
                  <span className="block text-[9px] text-slate-500 uppercase font-mono">BOM Total Cost</span>
                  <span className="text-sm font-bold text-white">
                    ${project.components.reduce((acc, c) => acc + c.estimatedPrice * c.quantity, 0).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Dynamic Budget Tiers */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 uppercase font-mono">Low-Budget</span>
                  <span className="text-base font-bold text-slate-300 mt-1 block">
                    ${project.budget?.lowBudget || 15}
                  </span>
                </div>
                <div className="p-3 bg-teal-950/20 border border-teal-500/15 rounded-xl text-center">
                  <span className="block text-[10px] text-teal-400 uppercase font-mono">Standard</span>
                  <span className="text-base font-bold text-teal-300 mt-1 block">
                    ${project.budget?.standard || 45}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 uppercase font-mono">Premium</span>
                  <span className="text-base font-bold text-slate-300 mt-1 block">
                    ${project.budget?.premium || 85}
                  </span>
                </div>
              </div>

              {/* BOM Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                      <th className="p-3">Component Name</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3">Specifications</th>
                      <th className="p-3">Alternative</th>
                      <th className="p-3 text-right">Est. Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {project.components.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/20">
                        <td className="p-3 font-semibold text-slate-200">
                          {comp.name}
                          <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                            {comp.purpose}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono">{comp.quantity}</td>
                        <td className="p-3 text-slate-400">{comp.specifications}</td>
                        <td className="p-3 text-slate-400 font-mono text-[10px]">{comp.alternative}</td>
                        <td className="p-3 text-right font-semibold text-slate-200">${comp.estimatedPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Alternative component updates */}
              {project.budget?.upgradeOptions && project.budget.upgradeOptions.length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-white block">Optional upgrades and replacements:</span>
                  <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1 leading-relaxed">
                    {project.budget.upgradeOptions.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB: Safety */}
          {activeTab === "safety" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Safety Instructions</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Makers must prioritize personal safety and handle tools, high-voltage circuits, and batteries properly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.safetyInstructions.map((rule, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border rounded-xl space-y-1.5 ${
                      rule.criticality === "high"
                        ? "bg-rose-500/5 border-rose-500/10 text-rose-300"
                        : rule.criticality === "medium"
                        ? "bg-amber-500/5 border-amber-500/10 text-amber-300"
                        : "bg-slate-950/60 border-slate-800 text-slate-300"
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center space-x-1.5">
                      <span className="text-base">⚠️</span>
                      <span className="uppercase">{rule.title}</span>
                      <span className="text-[9px] font-mono opacity-60 uppercase">({rule.criticality} risk)</span>
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Permanent general safety standards info box */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs text-slate-400 font-mono">
                <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-200 font-bold block mb-1">🔌 General Workshop Rule of Thumb</span>
                  Never leave soldering irons plugged in unattended, check battery terminals for short circuits or swelling before use, and inspect active current lines with a calibrated digital multimeter before completing connection schedules.
                </div>
              </div>
            </div>
          )}

          {/* TAB: Report */}
          {activeTab === "report" && (
            <ReportGenerator project={project} />
          )}
        </div>

        {/* Right side companion columns */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          {/* AI Mentor Chat assistant */}
          <ProjectMentorChat
            token={token}
            projectId={project.id}
            chatHistory={project.chatHistory}
            onMessageSent={handleChatUpdate}
          />

          {/* Dynamic Image Diagnostic visual node */}
          <VisualDiagnostic
            token={token}
            projectId={project.id}
            uploadedImages={project.uploadedImages}
            onAnalysisComplete={handleImageAnalysisUpdate}
          />

          {/* Curated Video references */}
          <VideoRecommendations
            token={token}
            projectId={project.id}
            currentStepIndex={project.currentStep}
          />
        </div>
      </div>
    </div>
  );
}
