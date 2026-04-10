export interface Settings {
  youtubeStreamKey: string;
  rtmpUrl: string;
  openaiApiKey: string;
  groqApiKey: string;
  newsApiKey: string;
  backendUrl: string;
  language: string;
  newsInterval: number;
}

export interface StreamStatus {
  isLive: boolean;
  startedAt: string | null;
  uptime: string | null;
  currentNews: string | null;
  videoCount: number;
  error: string | null;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
