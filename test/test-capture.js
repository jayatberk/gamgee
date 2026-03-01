const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

// Minimal JPEG buffer: FF D8 FF magic bytes
const FAKE_JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

// Mock before requiring capture module so screenshot-desktop is
// already replaced when src/capture/index.js loads it
mock.module('screenshot-desktop', {
  defaultExport: () => Promise.resolve(FAKE_JPEG),
});

const { captureScreen } = require('../src/capture');

describe('captureScreen', () => {
  it('returns a string', async () => {
    const result = await captureScreen();
    assert.equal(typeof result, 'string');
  });

  it('returns a non-empty string', async () => {
    const result = await captureScreen();
    assert.ok(result.length > 0);
  });

  it('returns valid base64', async () => {
    const result = await captureScreen();
    const decoded = Buffer.from(result, 'base64');
    assert.equal(decoded.toString('base64'), result);
  });

  it('returns a JPEG image', async () => {
    const result = await captureScreen();
    const decoded = Buffer.from(result, 'base64');
    assert.equal(decoded[0], 0xff);
    assert.equal(decoded[1], 0xd8);
    assert.equal(decoded[2], 0xff);
  });
});
