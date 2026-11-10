const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'
// O host é uma casca: API, Redis e Pusher vivem no deploy web.
// TODO: definir a URL real do deploy (ou exportar VIDEOKE_URL no ambiente de build/execução).
const PLACEHOLDER_URL = 'https://SEU-DEPLOY.vercel.app'
const HOST_URL = isDev ? 'http://localhost:3000' : (process.env.VIDEOKE_URL || PLACEHOLDER_URL)

function createWindow() {
  if (!isDev && HOST_URL === PLACEHOLDER_URL) {
    const msg = 'URL do deploy não configurada. Defina VIDEOKE_URL ou atualize PLACEHOLDER_URL em electron/main.js.'
    console.error(msg)
    dialog.showErrorBox('KaraokeLive', msg)
    app.quit()
    return
  }

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
