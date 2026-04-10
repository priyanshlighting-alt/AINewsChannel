export const DEFAULT_SETTINGS = {
  youtubeStreamKey: '',
  rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
  openaiApiKey: '',
  groqApiKey: '',
  newsApiKey: '',
  backendUrl: 'http://localhost:3001',
  language: 'mr',
  newsInterval: 5,
};

export const STORAGE_KEY = 'ai_news_channel_settings';

export const LOG_LEVELS = {
  info: { color: 'text-blue-400', icon: 'ℹ' },
  warn: { color: 'text-yellow-400', icon: '⚠' },
  error: { color: 'text-red-400', icon: '✗' },
  success: { color: 'text-green-400', icon: '✓' },
} as const;

export const POLL_INTERVAL_MS = 2000;
export const MAX_LOGS = 200;
