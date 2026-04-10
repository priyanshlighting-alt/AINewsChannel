import React, { useState, useEffect } from 'react';
import { Settings } from '@/types';
import { loadSettings, saveSettings } from '@/lib/storage';
import { setBackendUrl } from '@/lib/api';

interface SettingsPanelProps {
  onSaved?: () => void;
}

export default function SettingsPanel({ onSaved }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    setBackendUrl(settings.backendUrl);
  }, []);

  const handleChange = (field: keyof Settings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setBackendUrl(settings.backendUrl);
    setSaved(true);
    onSaved?.();
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass =
    'w-full bg-zinc-800 border border-zinc-600/60 text-zinc-100 rounded-xl px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition-all duration-200';
  const labelClass = 'block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2';

  return (
    <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <span className="text-blue-400 text-lg">⚙️</span>
          </div>
          <h2 className="text-lg font-semibold text-white">Settings</h2>
        </div>
        <button
          onClick={() => setShowKeys(!showKeys)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
        >
          {showKeys ? '🙈 Hide' : '👁 Show'} API Keys
        </button>
      </div>

      <div className="space-y-5">
        {/* Backend URL */}
        <div>
          <label className={labelClass}>Backend Server URL</label>
          <input
            type="url"
            value={settings.backendUrl}
            onChange={e => handleChange('backendUrl', e.target.value)}
            placeholder="http://your-vps-ip:3001"
            className={inputClass}
          />
          <p className="text-xs text-zinc-600 mt-1.5">Your Node.js backend running on VPS</p>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800" />

        {/* YouTube Stream Key */}
        <div>
          <label className={labelClass}>YouTube Stream Key</label>
          <input
            type={showKeys ? 'text' : 'password'}
            value={settings.youtubeStreamKey}
            onChange={e => handleChange('youtubeStreamKey', e.target.value)}
            placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
            className={inputClass}
          />
        </div>

        {/* RTMP URL */}
        <div>
          <label className={labelClass}>RTMP Server URL</label>
          <input
            type="text"
            value={settings.rtmpUrl}
            onChange={e => handleChange('rtmpUrl', e.target.value)}
            placeholder="rtmp://a.rtmp.youtube.com/live2"
            className={inputClass}
          />
        </div>

        <div className="border-t border-zinc-800" />

        {/* OpenAI API Key */}
        <div>
          <label className={labelClass}>OpenAI API Key</label>
          <input
            type={showKeys ? 'text' : 'password'}
            value={settings.openaiApiKey}
            onChange={e => handleChange('openaiApiKey', e.target.value)}
            placeholder="sk-..."
            className={inputClass}
          />
        </div>

        {/* Groq API Key */}
        <div>
          <label className={labelClass}>Groq API Key (Fallback)</label>
          <input
            type={showKeys ? 'text' : 'password'}
            value={settings.groqApiKey}
            onChange={e => handleChange('groqApiKey', e.target.value)}
            placeholder="gsk_..."
            className={inputClass}
          />
        </div>

        {/* News API Key */}
        <div>
          <label className={labelClass}>News API Key</label>
          <input
            type={showKeys ? 'text' : 'password'}
            value={settings.newsApiKey}
            onChange={e => handleChange('newsApiKey', e.target.value)}
            placeholder="Your newsapi.org key"
            className={inputClass}
          />
          <p className="text-xs text-zinc-600 mt-1.5">Get free key at <span className="text-blue-400">newsapi.org</span></p>
        </div>

        <div className="border-t border-zinc-800" />

        {/* News Interval */}
        <div>
          <label className={labelClass}>News Update Interval (minutes)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="2"
              max="15"
              value={settings.newsInterval}
              onChange={e => handleChange('newsInterval', parseInt(e.target.value))}
              className="flex-1 accent-red-500"
            />
            <span className="text-white font-bold text-sm w-8 text-center">{settings.newsInterval}</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`mt-6 w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 active:scale-95 ${
          saved
            ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20'
        }`}
      >
        {saved ? '✓ Settings Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
