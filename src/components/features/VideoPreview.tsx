import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VideoFile, getVideoStreamUrl } from '@/lib/api';

interface VideoPreviewProps {
  videos: VideoFile[];
  isLoading: boolean;
  onRefresh: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function VideoPreview({ videos, isLoading, onRefresh }: VideoPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedVideo = videos[selectedIndex] ?? null;
  const videoSrc = selectedVideo ? getVideoStreamUrl(selectedVideo.url) : null;

  // Reset state when selected video changes
  useEffect(() => {
    setIsPlaying(false);
    setVideoError(false);
    setIsVideoLoading(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  }, [selectedIndex, videoSrc]);

  // Auto-select the newest video when list refreshes
  useEffect(() => {
    if (videos.length > 0) setSelectedIndex(0);
  }, [videos.length]);

  const handlePlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => setVideoError(true));
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!selectedVideo || !videoSrc) return;
    const a = document.createElement('a');
    a.href = videoSrc;
    a.download = selectedVideo.filename;
    a.click();
  }, [selectedVideo, videoSrc]);

  return (
    <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <span className="text-purple-400 text-base">🎬</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white leading-none">Video Preview</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {videos.length > 0 ? `${videos.length} video${videos.length !== 1 ? 's' : ''} generated` : 'No videos yet'}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-700 transition-all duration-200 disabled:opacity-40 active:scale-95"
        >
          <svg
            className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {videos.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 border border-zinc-700">
            <span className="text-3xl">📹</span>
          </div>
          <p className="text-zinc-400 font-medium mb-1">No videos generated yet</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            Start streaming to generate your first Marathi news video. It will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Video Player */}
          <div className="relative bg-black rounded-xl overflow-hidden border border-zinc-700/50 aspect-video group">
            {videoSrc ? (
              <>
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className="w-full h-full object-contain"
                  preload="metadata"
                  onLoadStart={() => setIsVideoLoading(true)}
                  onCanPlay={() => setIsVideoLoading(false)}
                  onError={() => { setVideoError(true); setIsVideoLoading(false); }}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Loading spinner */}
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}

                {/* Error state */}
                {videoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center px-6">
                    <span className="text-3xl mb-3">⚠️</span>
                    <p className="text-red-400 font-medium text-sm mb-1">Preview unavailable</p>
                    <p className="text-zinc-500 text-xs">Backend server may not be reachable. Check your backend URL in Settings.</p>
                  </div>
                )}

                {/* Play/Pause overlay */}
                {!videoError && !isVideoLoading && (
                  <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
                      {isPlaying ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                  </button>
                )}

                {/* Video meta badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur rounded-lg px-2.5 py-1 text-xs text-zinc-300 font-mono">
                  {selectedVideo.filename.replace('news_', '').replace('.mp4', '')}
                </div>

                {/* Download button */}
                <button
                  onClick={handleDownload}
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur rounded-lg p-2 text-zinc-300 hover:text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                  title="Download video"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </>
            ) : null}
          </div>

          {/* Selected video info */}
          {selectedVideo && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/60 rounded-xl p-3 border border-zinc-700/40">
                <p className="text-xs text-zinc-500 mb-1">Generated</p>
                <p className="text-sm text-zinc-200 font-medium">{formatTime(selectedVideo.modifiedAt)}</p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-3 border border-zinc-700/40">
                <p className="text-xs text-zinc-500 mb-1">File Size</p>
                <p className="text-sm text-zinc-200 font-medium">{formatBytes(selectedVideo.size)}</p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-3 border border-zinc-700/40">
                <p className="text-xs text-zinc-500 mb-1">Index</p>
                <p className="text-sm text-zinc-200 font-medium">#{selectedIndex + 1} of {videos.length}</p>
              </div>
            </div>
          )}

          {/* Video list */}
          {videos.length > 1 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">All Videos</p>
              <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                {videos.map((v, i) => (
                  <button
                    key={v.filename}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 border ${
                      i === selectedIndex
                        ? 'bg-purple-600/15 border-purple-500/40 text-white'
                        : 'bg-zinc-800/40 border-zinc-700/30 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`text-xs font-bold w-5 text-center ${i === selectedIndex ? 'text-purple-400' : 'text-zinc-600'}`}>
                        {i + 1}
                      </span>
                      <span className="text-xs font-mono truncate">{v.filename}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-xs text-zinc-600">{formatBytes(v.size)}</span>
                      <span className="text-xs text-zinc-600">{formatTime(v.modifiedAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
