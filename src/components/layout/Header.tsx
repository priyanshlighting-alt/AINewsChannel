import React from 'react';
import newsBg from '@/assets/news-bg.jpg';

interface HeaderProps {
  isLive: boolean;
}

export default function Header({ isLive }: HeaderProps) {
  return (
    <header
      className="relative overflow-hidden"
      style={{
        backgroundImage: `url(${newsBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-zinc-950" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-widest">
            <span className="text-red-400">●</span>
            <span>AI News Broadcast System</span>
          </div>
          <div className="text-xs text-zinc-500">
            {new Date().toLocaleDateString('mr-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Main heading */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none mb-2">
              <span className="text-red-500">AI</span> वृत्त वाहिनी
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base font-medium">
              Automated Marathi News · YouTube Live Stream
            </p>
          </div>

          {/* Live pill */}
          {isLive ? (
            <div className="flex items-center gap-2 bg-red-600 px-5 py-2.5 rounded-full shadow-xl shadow-red-600/40 self-start sm:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute" />
              <span className="w-2.5 h-2.5 rounded-full bg-white relative" />
              <span className="text-white font-black text-sm tracking-widest uppercase">On Air</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-5 py-2.5 rounded-full self-start sm:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
              <span className="text-zinc-400 font-bold text-sm tracking-widest uppercase">Off Air</span>
            </div>
          )}
        </div>

        {/* News ticker strip */}
        <div className="mt-5 bg-red-700/90 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 overflow-hidden">
          <div className="flex items-center gap-4">
            <span className="bg-white text-red-700 font-black text-xs px-2.5 py-0.5 rounded uppercase tracking-wider shrink-0">
              Breaking
            </span>
            <div className="overflow-hidden flex-1">
              <p className="text-white text-sm font-medium whitespace-nowrap animate-marquee">
                🔴 AI वृत्त वाहिनी — दर ५ मिनिटांनी ताज्या बातम्या — भारत आणि जगभरातील घडामोडी — मराठीत — स्वयंचलित प्रसारण
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
