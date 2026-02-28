const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');

// Minimal valid WAV: "RIFF" at 0-3, "WAVE" at 8-11
const FAKE_WAV = Buffer.concat([
  Buffer.from('RIFF', 'ascii'),
  Buffer.alloc(4),
  Buffer.from('WAVE', 'ascii'),
]);

// Mock before requiring audio module so the mock is in place when
// node-record-lpcm16 is required inside src/audio/index.js
mock.module('node-record-lpcm16', {
  namedExports: {
    record: () => {
      const stream = new EventEmitter();
      process.nextTick(() => {
        stream.emit('data', FAKE_WAV);
        stream.emit('end');
      });
      return {
        stream: () => stream,
        stop: () => {},
      };
    },
  },
});

const { recordAudio } = require('../src/audio');

describe('recordAudio', () => {
  it('returns a string', async () => {
    const result = await recordAudio();
    assert.equal(typeof result, 'string');
  });

  it('returns a non-empty string', async () => {
    const result = await recordAudio();
    assert.ok(result.length > 0);
  });

  it('returns valid base64', async () => {
    const result = await recordAudio();
    const decoded = Buffer.from(result, 'base64');
    assert.equal(decoded.toString('base64'), result);
  });

  it('returns a WAV file', async () => {
    const result = await recordAudio();
    const decoded = Buffer.from(result, 'base64');
    assert.equal(decoded.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(decoded.subarray(8, 12).toString('ascii'), 'WAVE');
  });
});
