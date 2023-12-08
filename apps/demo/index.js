const { app, BrowserWindow, Menu, screen } = require('electron')

let mainWindow

app.on('ready', () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({ width, height })
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
    console.log(display)
    totalWidth += display.bounds.width
    if (display.bounds.height > maxHeight) {
      maxHeight = display.bounds.height
    }
  }

  // 设置窗口的位置和大小，使其跨越多个屏幕
  mainWindow.setBounds({ x: 0, y: 0, width: totalWidth, height: maxHeight })

  mainWindow.setFullScreen(true)
})
