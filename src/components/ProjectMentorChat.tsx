import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Cpu, Activity, AlertCircle } from "lucide-react";

interface ProjectMentorChatProps {
  token: string;
  projectId: string;
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[];
  onMessageSent: (newHistory: any[]) => void;
}

export default function ProjectMentorChat({
  token,
  projectId,
  chatHistory,
  onMessageSent,
}: ProjectMentorChatProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, sending]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const userMsg = message.trim();
    setMessage("");
    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with mentor");
      }

      onMessageSent(data.chatHistory);
    } catch (err: any) {
      console.error(err);
      setError("Failed to reach AI mentor. Please try sending again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[480px] overflow-hidden">
      {/* Mentor header */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="bg-teal-500/10 text-teal-400 p-1.5 rounded-lg border border-teal-500/20">
            <Cpu className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <span className="font-bold text-xs text-white block">AI Mentor Assistant</span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              Real-time diagnostic diagnostics
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-mono text-slate-400">ONLINE</span>
        </div>
      </div>

      {/* Message history */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {chatHistory.map((chat, idx) => {
          const isModel = chat.role === "model";
          const text = chat.parts[0]?.text || "";
          return (
            <div
              key={idx}
              className={`flex ${isModel ? "justify-start" : "justify-end"} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                  isModel
                    ? "bg-slate-950 text-slate-200 border border-slate-800"
                    : "bg-teal-500 text-slate-950 font-medium"
                }`}
              >
                {/* Clean inline bullet markdown renders */}
                {text.split("\n").map((line, i) => {
                  if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
                    return (
                      <li key={i} className="ml-3 my-0.5 list-disc">
                        {line.replace(/^[-*]\s*/, "")}
                      </li>
                    );
                  }
                  return <p key={i} className={i > 0 ? "mt-1.5" : ""}>{line}</p>;
                })}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-950 text-slate-400 border border-slate-800 rounded-xl p-3 text-xs flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 animate-spin text-teal-400" />
              <span>Formulating reply...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input panel */}
      <form onSubmit={handleSend} className="bg-slate-950/80 p-3 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question, request pin info, or diagnose error..."
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="p-2 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/30 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 rounded-lg transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
