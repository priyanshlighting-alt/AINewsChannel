import { Settings, StreamStatus, LogEntry, ApiResponse } from '@/types';

let backendBaseUrl = 'http://localhost:3001';

export function setBackendUrl(url: string) {
  backendBaseUrl = url.replace(/\/$/, '');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${backendBaseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const json = await res.json();
    return json as ApiResponse<T>;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: message };
  }
}

export async function startStream(settings: Settings): Promise<ApiResponse<{ message: string }>> {
  return request('/start-stream', {
    method: 'POST',
    body: JSON.stringify({
      streamKey: settings.youtubeStreamKey,
      rtmpUrl: settings.rtmpUrl,
      openaiApiKey: settings.openaiApiKey,
      groqApiKey: settings.groqApiKey,
      newsApiKey: settings.newsApiKey,
      language: settings.language,
      newsInterval: settings.newsInterval,
    }),
  });
}

export async function stopStream(): Promise<ApiResponse<{ message: string }>> {
  return request('/stop-stream', { method: 'POST' });
}

export async function getStatus(): Promise<ApiResponse<StreamStatus>> {
  return request('/status');
}

export async function getLogs(): Promise<ApiResponse<LogEntry[]>> {
  return request('/logs');
}

export interface VideoFile {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

export async function getVideos(): Promise<ApiResponse<VideoFile[]>> {
  return request('/videos');
}

export interface LatestNews {
  headline: string;
  script: string;
  generatedAt: string;
}

export async function getLatestNews(): Promise<ApiResponse<LatestNews | null>> {
  return request('/latest-news');
}

export function getVideoStreamUrl(relativeUrl: string): string {
  return `${backendBaseUrl}${relativeUrl}`;
}
