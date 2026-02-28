const screenshot = require('screenshot-desktop');

async function captureScreen() {
  const imgBuffer = await screenshot({ format: 'jpg' });
  return imgBuffer.toString('base64');
}

module.exports = {
  captureScreen
};
