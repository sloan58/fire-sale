const { app, BrowserWindow, dialog } = require('electron')
const fs = require('fs')

const windows = new Set()

const getFileFromUser = (exports.getFileFromUser = targetWindow => {
  const files = dialog
    .showOpenDialog(targetWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
      ]
    })
    .then(files => {
      if (files.canceled) return
      openFile(targetWindow, files.filePaths[0])
    })
})

const openFile = (targetWindow, file) => {
  const content = fs.readFileSync(file).toString()
  app.addRecentDocument(file)
  targetWindow.setRepresentedFilename(file)
  targetWindow.webContents.send('file-opened', file, content)
}

const createWindow = (exports.createWindow = () => {
  let x, y

  const currentWindow = BrowserWindow.getFocusedWindow()

  if (currentWindow) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition()
    x = currentWindowX + 10
    y = currentWindowY + 10
  }

  let newWindow = new BrowserWindow({
    x,
    y,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  newWindow.loadFile(`${__dirname}/index.html`)
  newWindow.once('ready-to-show', () => {
    newWindow.show()
  })
  newWindow.on('closed', () => {
    windows.delete(newWindow)
    newWindow = null
  })
  windows.add(newWindow)
  return newWindow
})

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') {
    return false
  }
  app.quit()
})

app.on('activate', (event, hasVisibleWindows) => {
  if (!hasVisibleWindows) {
    createWindow()
  }
})

app.on('will-finish-launching', () => {
  app.on('open-file', (event, file) => {
    const win = createWindow()
    win.once('ready-to-show', () => {
      openFile(win, file)
    })
  })
})
