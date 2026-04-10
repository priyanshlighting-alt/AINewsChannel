const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { addLog } = require('./logService');
const { TMP_DIR } = require('./ttsService');

const VIDEOS_DIR = path.join(__dirname, '..', 'videos');
const BG_IMAGE = path.join(__dirname, '..', 'assets', 'background.jpg');
const MAX_VIDEOS = 25;

if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });

/**
 * Build a video from background image + audio + headline text overlay using FFmpeg
 */
function generateVideo(audioPath, headline, outputPath) {
  return new Promise((resolve, reject) => {
    addLog('info', 'Rendering video with FFmpeg...');

    // Escape headline for FFmpeg drawtext (escape colons, single quotes, backslashes)
    const safeHeadline = headline
      .replace(/\\/g, '\\\\\\\\')
      .replace(/'/g, "\\'")
      .replace(/:/g, '\\:')
      .substring(0, 60);

    // FFmpeg command:
    // - Loop background image for the duration of audio
    // - Overlay headline text at bottom with semi-transparent box
    // - 1920x1080, H.264, AAC, 30fps — compatible with YouTube Live
    const ffmpegCmd = [
      'ffmpeg -y',
      `-loop 1 -i "${BG_IMAGE}"`,
      `-i "${audioPath}"`,
      '-filter_complex',
      `"[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[bg];`,
      `[bg]drawtext=text='${safeHeadline}':`,
      `fontcolor=white:fontsize=52:`,
      `x=(w-text_w)/2:y=h-200:`,
      `box=1:boxcolor=black@0.6:boxborderw=20:`,
      `line_spacing=10[out]"`,
      '-map "[out]" -map 1:a',
      '-c:v libx264 -preset ultrafast -crf 23',
      '-c:a aac -b:a 128k',
      '-r 30 -pix_fmt yuv420p',
      '-shortest',
      `"${outputPath}"`,
    ].join(' ');

    exec(ffmpegCmd, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err || !fs.existsSync(outputPath)) {
        addLog('error', `FFmpeg video render failed: ${err ? err.message : 'No output file'}`);
        return reject(new Error(`FFmpeg failed: ${err ? err.message : stderr.slice(-300)}`));
      }
      addLog('success', `Video rendered: ${path.basename(outputPath)}`);
      resolve(outputPath);
    });
  });
}

/**
 * Remove oldest videos if exceeding MAX_VIDEOS
 */
function pruneOldVideos() {
  try {
    const files = fs
      .readdirSync(VIDEOS_DIR)
      .filter(f => f.endsWith('.mp4'))
      .map(f => ({ name: f, time: fs.statSync(path.join(VIDEOS_DIR, f)).mtimeMs }))
      .sort((a, b) => a.time - b.time);

    while (files.length > MAX_VIDEOS) {
      const oldest = files.shift();
      fs.unlinkSync(path.join(VIDEOS_DIR, oldest.name));
      addLog('info', `Deleted old video: ${oldest.name}`);
    }
  } catch (err) {
    addLog('warn', `Prune error: ${err.message}`);
  }
}

function getNextVideoPath() {
  const ts = Date.now();
  return path.join(VIDEOS_DIR, `news_${ts}.mp4`);
}

function getAudioPath() {
  return path.join(TMP_DIR, `audio_${Date.now()}.mp3`);
}

module.exports = { generateVideo, pruneOldVideos, getNextVideoPath, getAudioPath, VIDEOS_DIR };
