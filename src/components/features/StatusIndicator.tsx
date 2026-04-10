import React from 'react';
import { StreamStatus } from '@/types';

interface StatusIndicatorProps {
  status: StreamStatus;
  backendConnected: boolean;
}

export default function StatusIndicator({ status, backendConnected }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* LIVE Badge */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm tracking-widest uppercase transition-all duration-300 ${
        status.isLive
          ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/40 animate-pulse'
          : 'bg-zinc-800 border-zinc-600 text-zinc-400'
      }`}>
        <span className={`w-2.5 h-2.5 rounded-full ${status.isLive ? 'bg-white' : 'bg-zinc-500'}`} />
        {status.isLive ? 'LIVE' : 'OFFLINE'}
      </div>

      {/* Backend connection */}
      <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
        backendConnected
          ? 'border-green-500/40 bg-green-500/10 text-green-400'
          : 'border-red-500/40 bg-red-500/10 text-red-400'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        {backendConnected ? 'Backend Connected' : 'Backend Offline'}
      </div>

      {/* Uptime */}
      {status.isLive && status.uptime && (
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400">
          <span>⏱</span>
          <span>{status.uptime}</span>
        </div>
      )}

      {/* Video count */}
      {status.videoCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-400">
          <span>🎬</span>
          <span>{status.videoCount} videos generated</span>
        </div>
      )}
    </div>
  );
}
