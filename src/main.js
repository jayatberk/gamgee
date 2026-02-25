const path = require('path');
const { app, BrowserWindow } = require('electron');
require('dotenv').config();

function mainStub() {
  console.log('mainStub: not implemented');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    title: '[gamgee]',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>[gamgee]</title>
      </head>
      <body>
        <h1>[gamgee]</h1>
        <p>Scaffold only. Features are not implemented yet.</p>
      </body>
    </html>
  `;

  win.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

module.exports = {
  mainStub,
  createWindow
};
