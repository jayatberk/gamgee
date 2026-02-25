const { contextBridge } = require('electron');

function preloadStub() {
  console.log('preloadStub: not implemented');
}

contextBridge.exposeInMainWorld('screenAssistant', {
  preloadStub
});

module.exports = {
  preloadStub
};
