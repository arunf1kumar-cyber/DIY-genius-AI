import React, { useState, useEffect } from "react";
import { Youtube, ExternalLink, Loader2, Play } from "lucide-react";
import { VideoRecommendation } from "../types";

interface VideoRecommendationsProps {
  token: string;
  projectId: string;
  currentStepIndex: number;
}

export default function VideoRecommendations({
  token,
  projectId,
  currentStepIndex,
}: VideoRecommendationsProps) {
  const [videos, setVideos] = useState<VideoRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVideos() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${projectId}/videos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch videos");
        }
        setVideos(data);
      } catch (err: any) {
        console.error(err);
        setError("Could not load video references.");
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, [projectId, currentStepIndex, token]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Youtube className="w-4 h-4 text-rose-500" />
          <span>Curated Tutorial References</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">
          High-quality video guides filtered dynamically for your active step.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 space-x-2">
          <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Matching steps with tutorials...</span>
        </div>
      ) : error ? (
        <p className="text-xs text-slate-500">{error}</p>
      ) : (
        <div className="space-y-3">
          {videos.map((vid, idx) => (
            <a
              key={idx}
              href={vid.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-teal-500/25 rounded-lg transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/5 border border-rose-500/10 px-2 py-0.5 rounded uppercase">
                    {vid.channel}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200 mt-1.5 group-hover:text-teal-300 transition-colors">
                    {vid.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {vid.description}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 text-slate-500 group-hover:text-rose-500 group-hover:bg-rose-500/10 transition-all shrink-0 ml-3">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] font-mono text-slate-500">
                <span>Duration: {vid.duration}</span>
                <span className="flex items-center space-x-1 hover:text-teal-400">
                  <span>Open Video</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
