const path = require('node:path')
const { app, BrowserWindow, Menu, screen, ipcMain } = require('electron')

let mainWindow
const cwd = process.cwd()
const dev = process.env.NODE_ENV === 'development'
const preloadUrl = path.resolve(cwd, './preload.js')

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: { devTools: dev, preload: preloadUrl },
  })

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
  mainWindow.setBounds({ x: 0, y: 0, width: 900, height: 600 })
  //   mainWindow.setFullScreen(dev)
  if (dev) mainWindow.webContents.openDevTools()
}
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
