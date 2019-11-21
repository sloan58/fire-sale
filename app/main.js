const { app, BrowserWindow, dialog, Menu } = require('electron')
const applicationMenu = require('./application-menu')
const fs = require('fs')

const windows = new Set()
const openFiles = new Map()

const getFileFromUser = (exports.getFileFromUser = targetWindow => {
  const files = dialog
    .showOpenDialog(targetWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
      ]
    })
    .then(({ canceled, filePaths }) => {
      if (canceled) return
      openFile(targetWindow, filePaths[0])
    })
})

const openFile = (exports.openFile = (targetWindow, file) => {
  const content = fs.readFileSync(file).toString()
  app.addRecentDocument(file)
  targetWindow.setRepresentedFilename(file)
  targetWindow.webContents.send('file-opened', file, content)
  startWatchingFile(targetWindow, file)
})

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

  newWindow.on('close', event => {
    if (newWindow.isDocumentEdited()) {
      event.preventDefault()
      const result = dialog
        .showMessageBox(newWindow, {
          type: 'warning',
          title: 'Quit with Unsaved Changes?',
          message: 'Your changes will be lost if you do not save.',
          buttons: ['Quit Anyway', 'Cancel'],
          defaultId: 0,
          cancelId: 1
        })
        .then(({ response }) => {
          if (response === 0) {
            newWindow.destroy()
          }
        })
    }
  })

  newWindow.on('closed', () => {
    windows.delete(newWindow)
    stopWatchingFile(newWindow)
    newWindow = null
  })

  windows.add(newWindow)

  return newWindow
})

const saveHtml = (exports.saveHtml = (targetWindow, content) => {
  dialog
    .showSaveDialog(targetWindow, {
      title: 'Save HTML',
      defaultPath: app.getPath('documents'),
      filters: [{ name: 'HTML Files', extensions: ['html', 'htm'] }]
    })
    .then(({ canceled, filePath }) => {
      if (canceled) return
      try {
        fs.writeFileSync(filePath, content)
      } catch (err) {
        console.log(err.message)
      }
    })
})

const saveMarkdown = (exports.saveMarkdown = (targetWindow, file, content) => {
  if (!file) {
    dialog
      .showSaveDialog(targetWindow, {
        title: 'Save Markdown',
        defaultPath: app.getPath('documents'),
        filters: [{ name: 'Markdown Files', extensions: ['md', 'markdown'] }]
      })
      .then(({ canceled, filePath }) => {
        if (canceled) return
        try {
          fs.writeFileSync(filePath, content)
          openFile(targetWindow, file)
        } catch (err) {
          console.log(err.message)
        }
      })
  } else {
    try {
      fs.writeFileSync(file, content)
      openFile(targetWindow, file)
    } catch (err) {
      console.log(err.message)
    }
  }
})

const startWatchingFile = (targetWindow, file) => {
  stopWatchingFile(targetWindow)
  const watcher = fs.watch(file, (eventType, filename) => {
    if (eventType === 'change') {
      const content = fs.readFileSync(file).toString()
      targetWindow.webContents.send('file-changed', file, content)
    }
  })
  openFiles.set(targetWindow, watcher)
}

const stopWatchingFile = targetWindow => {
  if (openFiles.has(targetWindow)) {
    openFiles.get(targetWindow).stop()
    openFiles.delete(targetWindow)
  }
}

app.on('ready', () => {
  Menu.setApplicationMenu(applicationMenu)
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
