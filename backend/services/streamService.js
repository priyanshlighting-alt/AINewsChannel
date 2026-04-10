const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { addLog } = require('./logService');
const { fetchNews, generateMarathiScript, extractHeadline } = require('./newsService');
const { generateSpeech } = require('./ttsService');
const { generateVideo, pruneOldVideos, getNextVideoPath, getAudioPath } = require('./videoService');

let ffmpegProcess = null;
let automationTimer = null;

// Latest generated news script — persisted in memory for /latest-news endpoint
let latestNewsStore = null;

function setLatestNews(headline, script, generatedAt) {
  latestNewsStore = { headline, script, generatedAt };
}

function getLatestNews() {
  return latestNewsStore;
}

let streamState = {
  isLive: false,
  startedAt: null,
  currentNews: null,
  videoCount: 0,
  error: null,
  config: null,
};

// Queue of ready video paths
let videoQueue = [];
let currentVideoPath = null;

function getStatus() {
  const uptime = streamState.startedAt
    ? formatUptime(Date.now() - new Date(streamState.startedAt).getTime())
    : null;
  return { ...streamState, uptime };
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Run the full pipeline: fetch → script → TTS → video → enqueue
 */
async function runPipeline(config) {
  const { newsApiKey, openaiApiKey, groqApiKey } = config;
  try {
    addLog('info', '--- Starting news pipeline cycle ---');

    // 1. Fetch news
    const articles = await fetchNews(newsApiKey);
    if (!articles.length) {
      addLog('warn', 'No articles found. Skipping cycle.');
      return;
    }

    // 2. Generate Marathi script
    const script = await generateMarathiScript(articles, openaiApiKey, groqApiKey);
    const headline = extractHeadline(script);
    streamState.currentNews = headline;
    setLatestNews(headline, script, new Date().toISOString());

    // 3. TTS
    const audioPath = getAudioPath();
    await generateSpeech(script, audioPath);

    // 4. Render video
    const videoPath = getNextVideoPath();
    await generateVideo(audioPath, headline, videoPath);

    // Cleanup audio
    try { fs.unlinkSync(audioPath); } catch {}

    // Enqueue
    videoQueue.push(videoPath);
    streamState.videoCount++;
    pruneOldVideos();

    addLog('success', `Pipeline complete. Queue: ${videoQueue.length} video(s).`);

    // If FFmpeg stream not yet started, start it now with first video
    if (streamState.isLive && !ffmpegProcess) {
      startFFmpegStream(config);
    }
  } catch (err) {
    addLog('error', `Pipeline error: ${err.message}`);
    streamState.error = err.message;
  }
}

/**
 * Stream the video queue continuously to YouTube via FFmpeg RTMP
 * Uses a playlist approach: concatenate + loop
 */
function startFFmpegStream(config) {
  const { rtmpUrl, streamKey } = config;
  const rtmpTarget = `${rtmpUrl}/${streamKey}`;

  if (!videoQueue.length) {
    addLog('warn', 'No videos in queue yet. Waiting...');
    return;
  }

  currentVideoPath = videoQueue.shift();

  addLog('info', `Starting FFmpeg RTMP stream to YouTube...`);
  addLog('info', `Video: ${path.basename(currentVideoPath)}`);

  // Build concat list for seamless looping
  const concatList = path.join(__dirname, '..', 'tmp', 'playlist.txt');
  fs.writeFileSync(concatList, `file '${currentVideoPath}'\n`);

  const args = [
    '-re',
    '-stream_loop', '-1',        // loop current video until next is ready
    '-i', currentVideoPath,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-maxrate', '3000k',
    '-bufsize', '6000k',
    '-pix_fmt', 'yuv420p',
    '-g', '60',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-f', 'flv',
    rtmpTarget,
  ];

  ffmpegProcess = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });

  ffmpegProcess.stderr.on('data', (data) => {
    const line = data.toString().trim();
    // Only log meaningful FFmpeg lines
    if (line.includes('frame=') || line.includes('fps=') || line.includes('bitrate=')) {
      addLog('info', `[FFmpeg] ${line.slice(0, 120)}`);
    } else if (line.toLowerCase().includes('error')) {
      addLog('error', `[FFmpeg] ${line.slice(0, 200)}`);
    }
  });

  ffmpegProcess.on('close', (code) => {
    addLog('warn', `FFmpeg process exited with code ${code}`);
    ffmpegProcess = null;

    if (!streamState.isLive) return;

    // Auto-reconnect after 5 seconds
    if (streamState.isLive) {
      streamState.error = `Stream disconnected (code ${code}). Reconnecting in 5s...`;
      addLog('warn', 'Auto-reconnecting in 5 seconds...');
      setTimeout(() => {
        if (streamState.isLive) {
          streamState.error = null;
          // Swap to next video if available
          if (videoQueue.length > 0) {
            currentVideoPath = videoQueue.shift();
          }
          startFFmpegStream(config);
        }
      }, 5000);
    }
  });

  ffmpegProcess.on('error', (err) => {
    addLog('error', `FFmpeg spawn error: ${err.message}. Is ffmpeg installed?`);
    streamState.error = err.message;
  });

  addLog('success', 'FFmpeg RTMP stream launched.');
}

/**
 * Swap to next video in queue (called by automation timer)
 */
function swapToNextVideo(config) {
  if (!streamState.isLive) return;
  if (!videoQueue.length) return;

  addLog('info', 'Swapping to next video in queue...');

  // Kill current FFmpeg, it will auto-reconnect with the new video
  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGTERM');
  }
}

async function startStream(config) {
  if (streamState.isLive) {
    addLog('warn', 'Stream already running.');
    return;
  }

  streamState.isLive = true;
  streamState.startedAt = new Date().toISOString();
  streamState.error = null;
  streamState.videoCount = 0;
  streamState.config = config;
  videoQueue = [];

  addLog('success', 'Stream initializing...');

  // Run first pipeline immediately
  await runPipeline(config);

  // Start FFmpeg if video is ready
  if (videoQueue.length > 0 && streamState.isLive) {
    startFFmpegStream(config);
  }

  // Schedule automation
  const intervalMs = (config.newsInterval || 5) * 60 * 1000;
  automationTimer = setInterval(async () => {
    if (!streamState.isLive) return;
    await runPipeline(config);
    swapToNextVideo(config);
  }, intervalMs);

  addLog('success', `Automation scheduled every ${config.newsInterval || 5} minutes.`);
}

function stopStream() {
  addLog('info', 'Stopping stream...');
  streamState.isLive = false;

  if (automationTimer) {
    clearInterval(automationTimer);
    automationTimer = null;
  }

  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGTERM');
    ffmpegProcess = null;
  }

  streamState.startedAt = null;
  streamState.currentNews = null;
  streamState.error = null;
  videoQueue = [];

  addLog('success', 'Stream stopped.');
}

module.exports = { startStream, stopStream, getStatus, getLatestNews };
