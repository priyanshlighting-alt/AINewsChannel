import React, { useEffect, useRef } from 'react';
import { LogEntry } from '@/types';
import { LOG_LEVELS } from '@/constants';

interface LogsPanelProps {
  logs: LogEntry[];
}

export default function LogsPanel({ logs }: LogsPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-IN', { hour12: false });
    } catch {
      return '--:--:--';
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-6 flex flex-col h-full min-h-[420px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
            <span className="text-green-400 text-lg">📋</span>
          </div>
          <h2 className="text-lg font-semibold text-white">System Logs</h2>
        </div>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
          {logs.length} entries
        </span>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 pr-1 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 py-12 gap-3">
            <span className="text-4xl">📡</span>
            <p className="text-sm">No logs yet. Start streaming to see live activity.</p>
          </div>
        ) : (
          <>
            {[...logs].reverse().map(log => {
              const meta = LOG_LEVELS[log.level] || LOG_LEVELS.info;
              return (
                <div
                  key={log.id}
                  className="flex gap-2 items-start py-1 px-2 rounded hover:bg-zinc-800/60 transition-colors group"
                >
                  <span className="text-zinc-600 shrink-0 mt-px group-hover:text-zinc-500 transition-colors">
                    {formatTime(log.timestamp)}
                  </span>
                  <span className={`shrink-0 font-bold ${meta.color}`}>{meta.icon}</span>
                  <span className={`leading-relaxed break-all ${meta.color}`}>{log.message}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  );
}
