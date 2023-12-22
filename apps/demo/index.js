const path = require('node:path')
const { app, BrowserWindow, Menu, screen, ipcMain, dialog } = require('electron')
const axios = require('axios').default

let mainWindow
const cwd = process.cwd()
const dev = process.env.NODE_ENV === 'development'
const preloadUrl = path.resolve(cwd, './preload.js')
let intervalId

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: { devTools: dev, preload: preloadUrl },
  })
  handleLogin(mainWindow)
  ipcMain.on('set-title', (event, title) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title)
  })

  // 创建一个空的菜单对象
  const menu = Menu.buildFromTemplate([])

  // 将菜单应用到窗口
  Menu.setApplicationMenu(menu)

  mainWindow.loadFile('index.html')

  // 获取所有屏幕的尺寸
  const displays = screen.getAllDisplays()
  let totalWidth = 0
  let maxHeight = 0
  for (const display of displays) {
    totalWidth += display.bounds.width
    if (display.bounds.height > maxHeight) maxHeight = display.bounds.height
  }
  console.log(totalWidth, maxHeight)
  // 设置窗口的位置和大小，使其跨越多个屏幕
  // mainWindow.setBounds({ x: 0, y: 0, width: totalWidth, height: maxHeight })
  mainWindow.setBounds({ x: 0, y: 0, width: 1200, height: 600 })
  //   mainWindow.setFullScreen(dev)
  if (dev) mainWindow.webContents.openDevTools()
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (!canceled) return filePaths[0]
}

function handleConfirmTolenReceived() {
  intervalId && clearInterval(intervalId)
  console.log('clear intervalId')
}
/**
 * 向渲染进程发送token，需要确保渲染进程收到
 * @param {import('electron').BrowserWindow} win
 */
function handleLogin(win) {
  axios
    .post('http://localhost:3000/api/auth/login', { phone: '18123845936', password: '5936' })
    .then((res) => {
      if (res.status === 200) {
        const token = res.headers['x-refresh-token']
        intervalId && clearInterval(intervalId)
        intervalId = setInterval(() => {
          console.log('send intervalId')
          win.webContents.send('update-token', token)
        }, 1000)
      }
    })
    .catch(console.error)
}
app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle('confirm-token', handleConfirmTolenReceived)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
