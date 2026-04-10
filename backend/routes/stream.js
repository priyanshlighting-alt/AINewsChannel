const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { startStream, stopStream, getStatus, getLatestNews } = require('../services/streamService');
const { getLogs } = require('../services/logService');

const VIDEOS_DIR = path.join(__dirname, '..', 'videos');

// POST /start-stream
router.post('/start-stream', async (req, res) => {
  const { streamKey, rtmpUrl, openaiApiKey, groqApiKey, newsApiKey, language, newsInterval } = req.body;

  if (!streamKey) {
    return res.status(400).json({ success: false, error: 'YouTube Stream Key is required.' });
  }
  if (!newsApiKey) {
    return res.status(400).json({ success: false, error: 'News API Key is required.' });
  }

  const status = getStatus();
  if (status.isLive) {
    return res.status(409).json({ success: false, error: 'Stream is already running.' });
  }

  // Start async — respond immediately
  res.json({ success: true, data: { message: 'Stream starting... Check logs for progress.' } });

  startStream({
    streamKey,
    rtmpUrl: rtmpUrl || 'rtmp://a.rtmp.youtube.com/live2',
    openaiApiKey: openaiApiKey || process.env.OPENAI_API_KEY || '',
    groqApiKey: groqApiKey || process.env.GROQ_API_KEY || '',
    newsApiKey: newsApiKey || process.env.NEWS_API_KEY || '',
    language: language || 'mr',
    newsInterval: parseInt(newsInterval) || 5,
  }).catch(console.error);
});

// POST /stop-stream
router.post('/stop-stream', (req, res) => {
  stopStream();
  res.json({ success: true, data: { message: 'Stream stopped successfully.' } });
});

// GET /status
router.get('/status', (req, res) => {
  const status = getStatus();
  res.json({ success: true, data: status });
});

// GET /logs
router.get('/logs', (req, res) => {
  const logs = getLogs(200);
  res.json({ success: true, data: logs });
});

// GET /videos — list all generated video files, newest first
router.get('/videos', (req, res) => {
  try {
    if (!fs.existsSync(VIDEOS_DIR)) {
      return res.json({ success: true, data: [] });
    }
    const files = fs
      .readdirSync(VIDEOS_DIR)
      .filter(f => f.endsWith('.mp4'))
      .map(f => {
        const stat = fs.statSync(path.join(VIDEOS_DIR, f));
        return {
          filename: f,
          url: `/videos/${f}`,
          size: stat.size,
          createdAt: stat.birthtime.toISOString(),
          modifiedAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

    res.json({ success: true, data: files });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /latest-news — returns last generated Marathi news script
router.get('/latest-news', (req, res) => {
  const latest = getLatestNews();
  if (!latest) {
    return res.json({ success: true, data: null });
  }
  res.json({ success: true, data: latest });
});

module.exports = router;
