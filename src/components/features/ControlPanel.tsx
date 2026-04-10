import React from 'react';
import { StreamStatus } from '@/types';

interface ControlPanelProps {
  status: StreamStatus;
  isStarting: boolean;
  isStopping: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function ControlPanel({
  status,
  isStarting,
  isStopping,
  onStart,
  onStop,
}: ControlPanelProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
          <span className="text-red-400 text-lg">📡</span>
        </div>
        <h2 className="text-lg font-semibold text-white">Stream Control</h2>
      </div>

      {/* Current News Ticker */}
      {status.currentNews && (
        <div className="mb-6 bg-zinc-800 border border-zinc-600/50 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Currently Broadcasting</p>
          <p className="text-sm text-amber-300 font-medium leading-relaxed">{status.currentNews}</p>
        </div>
      )}

      {/* Error Display */}
      {status.error && (
        <div className="mb-6 bg-red-950/40 border border-red-500/30 rounded-xl p-4">
          <p className="text-xs text-red-400 mb-1 uppercase tracking-wider">Stream Error</p>
          <p className="text-sm text-red-300 leading-relaxed">{status.error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <button
          onClick={onStart}
          disabled={status.isLive || isStarting || isStopping}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
            bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/40 active:scale-95"
        >
          {isStarting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Starting...
            </>
          ) : (
            <>
              <span className="text-lg">▶</span>
              Start Streaming
            </>
          )}
        </button>

        <button
          onClick={onStop}
          disabled={!status.isLive || isStopping || isStarting}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
            bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-600 hover:border-zinc-500 active:scale-95"
        >
          {isStopping ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Stopping...
            </>
          ) : (
            <>
              <span className="text-lg">■</span>
              Stop Streaming
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/40">
          <p className="text-xs text-zinc-500 mb-1">Automation</p>
          <p className="text-sm text-zinc-300 font-medium">Every 5 min</p>
        </div>
        <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/40">
          <p className="text-xs text-zinc-500 mb-1">Language</p>
          <p className="text-sm text-zinc-300 font-medium">मराठी (Marathi)</p>
        </div>
        <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/40">
          <p className="text-xs text-zinc-500 mb-1">Coverage</p>
          <p className="text-sm text-zinc-300 font-medium">India + World</p>
        </div>
        <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/40">
          <p className="text-xs text-zinc-500 mb-1">Storage</p>
          <p className="text-sm text-zinc-300 font-medium">Last 25 videos</p>
        </div>
      </div>
    </div>
  );
}
