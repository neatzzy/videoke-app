const { app, BrowserWindow } = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: !isDev,
    backgroundColor: '#060211',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:3000/host')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    // Production: Nuxt static output
    win.loadFile(path.join(__dirname, '../.output/public/index.html'))
    win.webContents.on('did-finish-load', () => {
      win.webContents.executeJavaScript("window.__nuxtApp.$router.push('/host')")
    })
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
