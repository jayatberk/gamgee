const { test } = require('node:test');
const assert = require('node:assert/strict');
const { captureScreen } = require('../src/capture');

test('captureScreen returns a string', async () => {
  const result = await captureScreen();
  assert.equal(typeof result, 'string');
});

test('captureScreen returns a nonempty string', async () => {
  const result = await captureScreen();
  assert.ok(result.length > 0);
});

test('captureScreen returns valid base64', async () => {
  const result = await captureScreen();
  const decoded = Buffer.from(result, 'base64');
  const reEncoded = decoded.toString('base64');
  assert.equal(result, reEncoded);
});

test('captureScreen returns a JPEG image', async () => {
  const result = await captureScreen();
  const decoded = Buffer.from(result, 'base64');
  // JPEG magic bytes: FF D8 FF
  assert.equal(decoded[0], 0xff);
  assert.equal(decoded[1], 0xd8);
  assert.equal(decoded[2], 0xff);
});
