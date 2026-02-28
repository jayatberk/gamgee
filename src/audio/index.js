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

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => {
      const audioBuffer = Buffer.concat(chunks);
      resolve(audioBuffer.toString('base64'));
    });
  });
}

module.exports = {
  recordAudio
};
