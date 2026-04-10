import React, { useState } from 'react';
import { LatestNews } from '@/lib/api';

interface LatestNewsCardProps {
  news: LatestNews | null;
}

/**
 * Parse the AI-generated Marathi script into individual news items.
 * Format expected:
 *   ## बातमी १
 *   **मथळा:** ...
 *   **वर्णन:** ...
 */
interface NewsItem {
  headline: string;
  description: string;
}

function parseScript(script: string): NewsItem[] {
  const items: NewsItem[] = [];
  // Split on section headers like ## बातमी १ or ## 1. or similar
  const sections = script.split(/\n##\s*/g).filter(Boolean);

  for (const section of sections) {
    const headlineMatch = section.match(/\*\*मथळा:\*\*\s*(.+)/);
    const descMatch = section.match(/\*\*वर्णन:\*\*\s*([\s\S]+?)(?=\n\n|\*\*|$)/);

    const headline = headlineMatch
      ? headlineMatch[1].trim()
      : section.split('\n').find(l => l.trim() && !l.startsWith('#'))?.replace(/[#*]/g, '').trim() ?? '';

    const description = descMatch
      ? descMatch[1].replace(/\n+/g, ' ').trim()
      : '';

    if (headline) items.push({ headline, description });
  }

  // Fallback: if nothing parsed, show the raw script as one block
  if (!items.length && script.trim()) {
    const lines = script.trim().split('\n').filter(Boolean);
    items.push({
      headline: lines[0].replace(/[#*]/g, '').trim(),
      description: lines.slice(1).join(' ').replace(/[#*]/g, '').trim(),
    });
  }

  return items;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('mr-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function LatestNewsCard({ news }: LatestNewsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

  const items = news ? parseScript(news.script) : [];

  return (
    <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center">
            <span className="text-amber-400 text-base">📰</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white leading-none">ताज्या बातम्या</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {news
                ? `${items.length} बातम्या · ${formatTime(news.generatedAt)} रोजी तयार`
                : 'अद्याप बातम्या नाहीत'}
            </p>
          </div>
        </div>

        {news && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-400">नवीन</span>
            </div>
          </div>
        )}
      </div>

      {!news ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 border border-zinc-700">
            <span className="text-2xl">🗞️</span>
          </div>
          <p className="text-zinc-400 font-medium mb-1">बातम्या उपलब्ध नाहीत</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            स्ट्रीम सुरू केल्यानंतर AI मराठी बातम्या तयार करेल. त्या येथे दिसतील.
          </p>
        </div>
      ) : (
        <div>
          {/* Main headline banner */}
          <div className="relative px-6 pt-5 pb-4 bg-gradient-to-r from-red-950/40 via-zinc-900/0 to-zinc-900/0">
            <div className="absolute left-0 top-5 bottom-4 w-1 bg-red-500 rounded-r-full" />
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 pl-1">
              ब्रेकिंग न्यूज
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug pl-1">
              {news.headline}
            </h3>
          </div>

          {/* News item tabs — if multiple items parsed */}
          {items.length > 1 && (
            <div className="flex gap-1.5 px-6 pt-2 pb-0 flex-wrap">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveItem(i)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 border ${
                    activeItem === i
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-zinc-800/60 border-zinc-700/40 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  बातमी {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Active news item content */}
          {items[activeItem] && (
            <div className="px-6 pt-4 pb-5">
              {items.length > 1 && (
                <p className="text-sm font-bold text-white mb-2 leading-snug">
                  {items[activeItem].headline}
                </p>
              )}
              {items[activeItem].description && (
                <p className={`text-sm text-zinc-400 leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
                  {items[activeItem].description}
                </p>
              )}
              {items[activeItem].description && items[activeItem].description.length > 200 && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {expanded ? '▲ कमी दाखवा' : '▼ अधिक वाचा'}
                </button>
              )}
            </div>
          )}

          {/* Full script toggle */}
          <div className="border-t border-zinc-800 px-6 py-3">
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              {expanded ? 'संपूर्ण स्क्रिप्ट लपवा' : 'संपूर्ण AI स्क्रिप्ट पाहा'}
            </button>

            {expanded && (
              <div className="mt-3 bg-zinc-950 rounded-xl p-4 border border-zinc-800 max-h-60 overflow-y-auto custom-scrollbar">
                <pre className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed font-sans">
                  {news.script}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
