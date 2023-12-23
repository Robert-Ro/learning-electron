const path = require('node:path')
const { app, BrowserWindow, Menu, screen, ipcMain } = require('electron')
const axios = require('axios')

const isDev = process.env.NODE_ENV === 'development'
 

let mainWindow

const preload = path.resolve(__dirname, './preload.js')
const envMap = {
  dev: {
    webUrl: 'https://192.168.110.127:7001',
    apiUrl: 'http://192.168.110.141:9300',
    username: 'admin',
    password: 'EcarTech@Etlink!123',
  },
  sit: {
    webUrl: 'https://192.168.1.6:7001',
    apiUrl: 'http://192.168.110.141:9300',
    username: 'admin',
    password: 'EcarTech@Etlink!123',
  },
  prod: { webUrl: 'https://192.168.1.6:7001', apiUrl: 'https://etlink.ecar.com/app', username: '', password: '' },
}
/**
 * 打包时注入的环境变量
 */
const envName = process.env.ENV_NAME || 'dev'
/**
 * 环境配置
 */
const env = envMap[envName]
/**
 * 轮询发送token的id
 * @type {NodeJS.Timer}
 */
let intervalId
let isLogining
/**
 * 当前车辆id
 */
let vehicleId = '1566699981373374465'
const axiosHttp = axios.create()
/**
 * 向渲染进程发送token，需要确保渲染进程收到
 * @param {import('electron').BrowserWindow} win
 */
function onLogin(win) {
  if (isLogining) return
  isLogining = true
  axiosHttp
    .post(`${env.apiUrl}/etlink-opt-system/sys/login`, { username: env.username, password: env.password })
    .then((res) => {
      if (res.data.code === '000000') {
        const token = res.data.result.token
        intervalId && clearInterval(intervalId)
        intervalId = setInterval(() => {
          console.log('send intervalId')
          win.webContents.send('update-token', token)
        }, 1000)
      }
    })
    .catch(console.error)
    .finally(() => {
      isLogining = false
    })
}
/**
 * 确认收到token
 */
function onTokenReceived() {
  intervalId && clearInterval(intervalId)
  console.log('clear intervalId')
}
/**
 * 更换车辆id
 * @param {string} id
 */
function onChangeVehicle(id) {
  vehicleId = id
  mainWindow.loadURL(`${env.webUrl}?vehicleId=${vehicleId}`)
}

// NOTE 开发机器是遇到net:ERR_PROXY_CONNECTION_FAILED错误，故添加代理服务器
if (isDev) app.commandLine.appendSwitch('proxy-server', 'http://127.0.0.1:7890')
app.on('ready', () => {
  ipcMain.handle('confirm-token', onTokenReceived)
  ipcMain.handle('change-vehicle', onChangeVehicle)

  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload,
    },
  })
  ipcMain.handle('need-login', () => onLogin(mainWindow))
  // 创建一个空的菜单对象
  const menu = Menu.buildFromTemplate([])
  // 将菜单应用到窗口
  Menu.setApplicationMenu(menu)
  mainWindow.loadURL(`${env.webUrl}?vehicleId=${vehicleId}`)
  if (isDev) mainWindow.webContents.openDevTools()
  mainWindow.setFullScreen(true)
})
