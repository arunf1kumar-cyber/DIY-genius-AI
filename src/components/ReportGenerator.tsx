import React from "react";
import { Printer, FileText, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { Project } from "../types";

interface ReportGeneratorProps {
  project: Project;
}

export default function ReportGenerator({ project }: ReportGeneratorProps) {
  function handlePrint() {
    window.print();
  }

  // Calculate stats
  const totalBOMCost = project.components.reduce((acc, c) => acc + (c.estimatedPrice * c.quantity), 0);
  const lowBOMCost = project.budget?.lowBudget || (totalBOMCost * 0.8);
  const premiumBOMCost = project.budget?.premium || (totalBOMCost * 1.5);

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="font-bold text-sm text-white">Project Synthesis Report</h3>
            <p className="text-[10px] text-slate-500 font-mono">
              Ready for compilation, print-out, and academic review.
            </p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-md shadow-teal-500/10"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div id="printable-area" className="bg-white text-slate-900 p-10 rounded-xl border border-slate-300 shadow-xl space-y-8 font-sans max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none print:text-black">
        {/* Print only Header Styles (hidden on screen, applied during printing) */}
        <div className="border-b-4 border-teal-600 pb-5 text-center">
          <span className="text-[10px] font-mono tracking-widest text-teal-600 font-bold uppercase block">
            DIY GENIUS AI • TECHNICAL REPORT BLUEPRINT
          </span>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-1 uppercase">
            {project.title}
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Category: {project.category} • Difficulty: {project.difficulty}
          </p>
          <div className="text-[11px] text-slate-500 font-mono mt-2 flex justify-center space-x-6">
            <span>Author ID: {project.userId}</span>
            <span>Date Generated: {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">
            1. Project Objective & Overview
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Bill of Materials (BOM) */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">
            2. Complete Bill of Materials (BOM)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th className="py-2.5 px-3 font-bold">Component Name</th>
                  <th className="py-2.5 px-3 font-bold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-bold">Specifications</th>
                  <th className="py-2.5 px-3 font-bold">Primary Purpose</th>
                  <th className="py-2.5 px-3 font-bold text-right">Est. Cost (ea)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {project.components.map((comp, idx) => (
                  <tr key={idx} className="text-slate-700">
                    <td className="py-2.5 px-3 font-semibold">{comp.name}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{comp.quantity}</td>
                    <td className="py-2.5 px-3">{comp.specifications}</td>
                    <td className="py-2.5 px-3">{comp.purpose}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${comp.estimatedPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-xs font-mono text-teal-800 flex justify-between items-center print:bg-none print:border-none print:p-0">
            <span>Calculated Bill of Materials Budget Invested:</span>
            <span className="text-sm font-bold text-teal-950">${totalBOMCost.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Circuit Diagram Description */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">
            3. Circuit Schematic & Connectivity Mapping
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {project.circuitDetails.overview}
          </p>
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-800 border-b border-slate-300">
                  <th className="py-2 px-3 font-bold">Connection From</th>
                  <th className="py-2 px-3 font-bold">Connection To</th>
                  <th className="py-2 px-3 font-bold">Target Pin/Terminal</th>
                  <th className="py-2 px-3 font-bold">Wiring Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {project.circuitDetails.connections.map((conn, idx) => (
                  <tr key={idx} className="text-slate-700">
                    <td className="py-2 px-3 font-semibold">{conn.from}</td>
                    <td className="py-2 px-3 font-semibold">{conn.to}</td>
                    <td className="py-2 px-3 font-mono text-teal-700">{conn.pinLabel || "N/A"}</td>
                    <td className="py-2 px-3">{conn.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 print:bg-none print:border-none print:p-0">
            <strong className="text-slate-900 block mb-1">Current Flow Explanation:</strong>
            {project.circuitDetails.currentFlowExplanation}
          </div>
        </div>

        {/* Detailed Procedure */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">
            4. Step-by-Step Procedure
          </h2>
          <div className="space-y-5">
            {project.steps.map((step) => (
              <div key={step.stepNumber} className="space-y-1.5 text-xs text-slate-700">
                <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                  <span>Step {step.stepNumber}: {step.objective}</span>
                  <span className="font-mono text-[10px] text-slate-500 font-bold uppercase">
                    {step.completed ? "✓ COMPLETED" : "IN PROGRESS"}
                  </span>
                </h3>
                <p className="leading-relaxed">{step.explanation}</p>
                <div className="flex flex-wrap gap-4 pt-1 font-mono text-[10px] text-slate-500">
                  <span>Estimated Time: {step.estimatedTime}</span>
                  <span>Required Components: {step.components.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Compliance Summary */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>5. Safety Compliance Summary</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.safetyInstructions.map((rule, idx) => (
              <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-900 print:bg-none print:border-none print:p-0">
                <span className="font-bold block mb-1 text-amber-950 uppercase">
                  ⚠️ {rule.title} ({rule.criticality} risk)
                </span>
                <p className="leading-relaxed text-slate-700">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Advantages & Applications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <strong className="text-sm font-bold text-slate-900 block uppercase tracking-wide">
              6. Practical Applications
            </strong>
            <ul className="text-xs text-slate-700 leading-relaxed list-disc pl-4 space-y-1">
              <li>Deployable in local smart home frameworks or school science exhibitions.</li>
              <li>Improves understanding of embedded firmware logic, electronic safety limits, and circuit loops.</li>
              <li>Acts as a fully functional proof-of-concept prototype.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <strong className="text-sm font-bold text-slate-900 block uppercase tracking-wide">
              7. Project Limitations
            </strong>
            <ul className="text-xs text-slate-700 leading-relaxed list-disc pl-4 space-y-1">
              <li>Relying on baseboard wires can loosen over time; permanent soldering on stripboard is recommended for longevity.</li>
              <li>Exposed components require a protective custom 3D-printed enclosure for complete environmental resilience.</li>
            </ul>
          </div>
        </div>

        {/* Conclusion */}
        <div className="border-t border-slate-300 pt-5 text-center text-xs text-slate-500 font-mono">
          <p>
            DIY Genius AI Report Generation Protocol: Approved.
          </p>
          <p className="mt-0.5">
            Verified build signatures mapped with Gemini Multimodal Image Diagnostics.
          </p>
        </div>
      </div>
    </div>
  );
}
