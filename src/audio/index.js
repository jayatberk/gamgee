const { record } = require('node-record-lpcm16');

function recordAudio() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const recording = record({
      sampleRate: 16000,
      channels: 1,
      audioType: 'wav',
      endOnSilence: true,
      silence: '1.5',
    });
    const stream = recording.stream();

    const timeout = setTimeout(() => {
      recording.stop();
    }, 30000);

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
    stream.on('end', () => {
      clearTimeout(timeout);
      const audioBuffer = Buffer.concat(chunks);
      resolve(audioBuffer.toString('base64'));
    });
  });
}

module.exports = {
  recordAudio
};
