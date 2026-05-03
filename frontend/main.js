const { app, BrowserWindow, Tray, Menu, nativeImage, Notification } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let mainWindow = null
let tray = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    title: 'FocusFlow',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  })

  // Load Vite dev server or built files
  const isDev = !app.isPackaged
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createTray() {
  // Simple tray icon
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open FocusFlow', click: () => {
      if (mainWindow) mainWindow.show()
      else createWindow()
    }},
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ])

  tray.setToolTip('FocusFlow — Tracking your screen time')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow) mainWindow.show()
    else createWindow()
  })
}

app.whenReady().then(() => {
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  // Keep app running in tray on Windows
  if (process.platform !== 'darwin') {
    // Don't quit — stay in tray
  }
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})