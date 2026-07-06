import React, { useState, useRef } from "react";
import { Upload, Camera, Loader2, CheckCircle, ShieldAlert, Image as ImageIcon } from "lucide-react";

interface VisualDiagnosticProps {
  token: string;
  projectId: string;
  onAnalysisComplete: (updatedProject: any) => void;
  uploadedImages: { url: string; analyzedAt: string; feedback: string }[];
}

export default function VisualDiagnostic({
  token,
  projectId,
  onAnalysisComplete,
  uploadedImages,
}: VisualDiagnosticProps) {
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert uploaded file to base64
  function processFile(file: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (.png, .jpg, .jpeg)");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Str = reader.result as string;
      await uploadAndAnalyze(base64Str, file.type);
    };
    reader.onerror = () => {
      setError("Failed to read image file.");
    };
  }

  async function uploadAndAnalyze(base64Image: string, mimeType: string) {
    setAnalyzing(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/analyze-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ base64Image, mimeType }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setFeedback(data.feedback);
      onAnalysisComplete(data.project);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze wiring photo.");
    } finally {
      setAnalyzing(false);
    }
  }

  // Handle Drag events
  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  // Handle Drop event
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }

  // Handle Input select
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Camera className="w-4 h-4 text-teal-400" />
          <span>AI Visual Circuit Diagnostic Node</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Upload breadboard photos, soldering connections, or schematics for smart verification.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 select-none ${
          dragActive
            ? "border-teal-400 bg-teal-500/5"
            : "border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        {analyzing ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
            <span className="text-xs font-semibold text-slate-200">Analyzing Circuit layout...</span>
            <span className="text-[9px] text-slate-500 font-mono">Comparing pins, wires, and PCB layout</span>
          </div>
        ) : (
          <>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              <Upload className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Drag & Drop Wiring Photo</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">or click to browse local files</span>
            </div>
          </>
        )}
      </div>

      {/* Diagnostic Analysis Feedback Result */}
      {feedback && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 animate-fade-in">
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Analysis Result Generated</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
            {feedback}
          </div>
        </div>
      )}

      {/* List of previously analyzed photos */}
      {uploadedImages.length > 0 && (
        <div className="pt-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
            Verification History ({uploadedImages.length})
          </span>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {uploadedImages.map((img, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-slate-950/60 border border-slate-800/60 rounded-lg text-[11px] font-mono"
              >
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300">Photo_{uploadedImages.length - i}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(img.analyzedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
