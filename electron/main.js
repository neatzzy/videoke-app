const { app, BrowserWindow, dialog } = require('electron')
const path = require('node:path')

const isDev = process.env.NODE_ENV === 'development'
// O host é uma casca: API, Redis e Pusher vivem no deploy web.
// VIDEOKE_URL sobrescreve o deploy padrão (útil para testar um preview).
const DEPLOY_URL = 'https://videoke-app-wine.vercel.app'
const HOST_URL = isDev ? 'http://localhost:3000' : (process.env.VIDEOKE_URL || DEPLOY_URL)

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

  win.loadURL(`${HOST_URL}/host`).catch((err) => {
    console.error('Falha ao carregar', HOST_URL, err)
    dialog.showErrorBox('KaraokeLive', `Não foi possível abrir ${HOST_URL}/host\n${err.message}`)
  })
  if (isDev) win.webContents.openDevTools({ mode: 'detach' })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
