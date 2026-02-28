const { spawn } = require('child_process');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');

function speakWithSay(text) {
  return new Promise((resolve, reject) => {
    const proc = spawn('say', [text]);
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`say exited with code ${code}`));
    });
  });
}

function speakWithAI(text) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const body = JSON.stringify({ model: 'tts-1', input: text, voice: 'alloy' });

    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/audio/speech',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      const tmpFile = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`);
      const fileStream = fs.createWriteStream(tmpFile);

      res.pipe(fileStream);

      fileStream.on('finish', () => {
        const proc = spawn('play', [tmpFile]);
        proc.on('error', reject);
        proc.on('close', () => {
          fs.unlink(tmpFile, () => resolve());
        });
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function speakText(text) {
  if (process.platform === 'darwin') {
    return speakWithSay(text);
  }
  return speakWithAI(text);
}

module.exports = {
  speakText
};
