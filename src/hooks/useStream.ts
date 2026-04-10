import { useState, useEffect, useCallback, useRef } from 'react';
import { StreamStatus, LogEntry } from '@/types';
import { getStatus, getLogs, startStream, stopStream, setBackendUrl, getVideos, getLatestNews, VideoFile, LatestNews } from '@/lib/api';
import { loadSettings } from '@/lib/storage';
import { POLL_INTERVAL_MS, MAX_LOGS } from '@/constants';

export function useStream() {
  const [status, setStatus] = useState<StreamStatus>({
    isLive: false,
    startedAt: null,
    uptime: null,
    currentNews: null,
    videoCount: 0,
    error: null,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [isVideosLoading, setIsVideosLoading] = useState(false);
  const [latestNews, setLatestNews] = useState<LatestNews | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLocalLog = useCallback((level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      id: `local-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    setLogs(prev => [entry, ...prev].slice(0, MAX_LOGS));
  }, []);

  const fetchVideos = useCallback(async () => {
    setIsVideosLoading(true);
    const res = await getVideos();
    if (res.success && res.data) setVideos(res.data);
    setIsVideosLoading(false);
  }, []);

  const fetchLatestNews = useCallback(async () => {
    const res = await getLatestNews();
    if (res.success && res.data) setLatestNews(res.data);
  }, []);

  const fetchStatus = useCallback(async () => {
    const settings = loadSettings();
    setBackendUrl(settings.backendUrl);
    const res = await getStatus();
    if (res.success && res.data) {
      setStatus(res.data);
      setBackendConnected(true);
    } else {
      setBackendConnected(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    const res = await getLogs();
    if (res.success && res.data) {
      setLogs(res.data.slice(0, MAX_LOGS));
    }
  }, []);

  const poll = useCallback(async () => {
    await fetchStatus();
    await fetchLogs();
    await fetchVideos();
    await fetchLatestNews();
  }, [fetchStatus, fetchLogs, fetchVideos, fetchLatestNews]);

  useEffect(() => {
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [poll]);

  const handleStart = useCallback(async () => {
    const settings = loadSettings();
    if (!settings.youtubeStreamKey) {
      addLocalLog('error', 'YouTube Stream Key is required. Please configure in Settings.');
      return;
    }
    if (!settings.newsApiKey) {
      addLocalLog('error', 'News API Key is required. Please configure in Settings.');
      return;
    }
    setIsStarting(true);
    addLocalLog('info', 'Sending start command to backend...');
    const res = await startStream(settings);
    if (res.success) {
      addLocalLog('success', res.data?.message || 'Stream started successfully!');
      await poll();
    } else {
      addLocalLog('error', `Failed to start stream: ${res.error}`);
    }
    setIsStarting(false);
  }, [addLocalLog, poll]);

  const handleStop = useCallback(async () => {
    setIsStopping(true);
    addLocalLog('info', 'Sending stop command to backend...');
    const res = await stopStream();
    if (res.success) {
      addLocalLog('success', res.data?.message || 'Stream stopped.');
      await poll();
    } else {
      addLocalLog('error', `Failed to stop stream: ${res.error}`);
    }
    setIsStopping(false);
  }, [addLocalLog, poll]);

  return {
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
    refreshVideos: fetchVideos,
  };
}
