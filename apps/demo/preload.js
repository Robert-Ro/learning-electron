const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.send('set-title', title),
  //   openFile: () => ipcRenderer.invoke('dialog:openFile'),
  // 处理token同步
  confirmToken: () => ipcRenderer.invoke('confirm-token'),
  onUpdateToken: (callback) => ipcRenderer.on('update-token', (_event, value) => callback(value)),
})
