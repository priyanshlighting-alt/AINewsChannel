const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { addLog } = require('./logService');

const TMP_DIR = path.join(__dirname, '..', 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

/**
 * Convert Marathi text to speech using gTTS (Python)
 * gTTS must be installed: pip install gTTS
 */
function generateSpeech(text, outputPath) {
  return new Promise((resolve, reject) => {
    addLog('info', 'Generating Marathi TTS audio...');

    // Clean text for TTS
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/##/g, '')
      .replace(/[#*]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Write text to temp file to avoid shell escaping issues
    const textFile = path.join(TMP_DIR, `tts_input_${Date.now()}.txt`);
    fs.writeFileSync(textFile, cleanText, 'utf8');

    const pythonScript = `
import sys
from gtts import gTTS
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    text = f.read()
tts = gTTS(text=text, lang='mr', slow=False)
tts.save(sys.argv[2])
print("TTS_SUCCESS")
`;

    const scriptFile = path.join(TMP_DIR, `tts_script_${Date.now()}.py`);
    fs.writeFileSync(scriptFile, pythonScript, 'utf8');

    const cmd = `python3 "${scriptFile}" "${textFile}" "${outputPath}"`;

    exec(cmd, { timeout: 60000 }, (err, stdout, stderr) => {
      // Cleanup temp files
      try { fs.unlinkSync(textFile); } catch {}
      try { fs.unlinkSync(scriptFile); } catch {}

      if (err || !fs.existsSync(outputPath)) {
        addLog('error', `TTS failed: ${err ? err.message : stderr}`);
        return reject(new Error(`TTS generation failed: ${err ? err.message : stderr}`));
      }
      addLog('success', `Audio generated: ${path.basename(outputPath)}`);
      resolve(outputPath);
    });
  });
}

module.exports = { generateSpeech, TMP_DIR };
