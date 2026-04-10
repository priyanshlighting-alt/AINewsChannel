import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import StatusIndicator from '@/components/features/StatusIndicator';
import ControlPanel from '@/components/features/ControlPanel';
import SettingsPanel from '@/components/features/SettingsPanel';
import LogsPanel from '@/components/features/LogsPanel';
import VideoPreview from '@/components/features/VideoPreview';
import LatestNewsCard from '@/components/features/LatestNewsCard';
import { useStream } from '@/hooks/useStream';

type Tab = 'control' | 'settings' | 'logs' | 'videos';

export default function Dashboard() {
  const {
    status,
    logs,
    videos,
    isVideosLoading,
    latestNews,
    isStarting,
    isStopping,
    backendConnected,
    handleStart,
    handleStop,
    addLocalLog,
    refreshVideos,
  } = useStream();

  const [activeTab, setActiveTab] = useState<Tab>('control');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'control', label: 'Control', icon: '📡' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'logs', label: `Logs (${logs.length})`, icon: '📋' },
    { id: 'videos', label: `Videos (${videos.length})`, icon: '🎬' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header isLive={status.isLive} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status bar */}
        <div className="mb-6">
          <StatusIndicator status={status} backendConnected={backendConnected} />
        </div>

        {/* Desktop: side-by-side layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ControlPanel
              status={status}
              isStarting={isStarting}
              isStopping={isStopping}
              onStart={handleStart}
              onStop={handleStop}
            />
            <SettingsPanel onSaved={() => addLocalLog('success', 'Settings saved to localStorage.')} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <LatestNewsCard news={latestNews} />
            <VideoPreview
              videos={videos}
              isLoading={isVideosLoading}
              onRefresh={refreshVideos}
            />
            <LogsPanel logs={logs} />
          </div>
        </div>

        {/* Mobile: tab layout */}
        <div className="lg:hidden">
          {/* Tab pills */}
          <div className="flex gap-2 mb-5 bg-zinc-900 border border-zinc-700/60 p-1.5 rounded-2xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {activeTab === 'control' && (
              <ControlPanel
                status={status}
                isStarting={isStarting}
                isStopping={isStopping}
                onStart={handleStart}
                onStop={handleStop}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel onSaved={() => addLocalLog('success', 'Settings saved to localStorage.')} />
            )}
            {activeTab === 'logs' && <LogsPanel logs={logs} />}
            {activeTab === 'videos' && (
              <VideoPreview
                videos={videos}
                isLoading={isVideosLoading}
                onRefresh={refreshVideos}
              />
            )}
          </div>
        </div>

        {/* Pipeline visual */}
        <div className="mt-8 bg-zinc-900 border border-zinc-700/60 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-5">Automation Pipeline</h3>
          <div className="flex flex-wrap items-center gap-2 sm:gap-0">
            {[
              { icon: '📰', label: 'Fetch News', sub: 'NewsAPI' },
              { icon: '🤖', label: 'Generate Script', sub: 'OpenAI / Groq' },
              { icon: '🔊', label: 'Text to Speech', sub: 'gTTS (Marathi)' },
              { icon: '🎬', label: 'Render Video', sub: 'FFmpeg' },
              { icon: '📺', label: 'Stream Live', sub: 'YouTube RTMP' },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1.5 flex-1 min-w-[90px]">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border ${
                    status.isLive
                      ? 'bg-red-600/20 border-red-500/40'
                      : 'bg-zinc-800 border-zinc-700'
                  }`}>
                    {step.icon}
                  </div>
                  <p className="text-xs font-semibold text-zinc-300 text-center leading-tight">{step.label}</p>
                  <p className="text-xs text-zinc-600 text-center">{step.sub}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className={`hidden sm:flex text-lg mx-1 ${status.isLive ? 'text-red-500' : 'text-zinc-700'}`}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12 py-6 text-center text-xs text-zinc-600">
        <p>AI वृत्त वाहिनी — Automated Marathi News Broadcasting System</p>
        <p className="mt-1">Deploy backend on Hetzner VPS · Streams 24×7 via FFmpeg RTMP</p>
      </footer>
    </div>
  );
}
