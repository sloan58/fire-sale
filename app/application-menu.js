const { app, BrowserWindow, Menu, shell } = require('electron')
const mainProcess = require('./main')
const template = [
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CommandOrControl+Z', role: 'undo' },
      { label: 'Redo', accelerator: 'Shift+CommandOrControl+Z', role: 'redo' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CommandOrControl+X', role: 'cut' },
      { label: 'Copy', accelerator: 'CommandOrControl+C', role: 'copy' },
      { label: 'Paste', accelerator: 'CommandOrControl+V', role: 'paste' },
      {
        label: 'Select All',
        accelerator: 'CommandOrControl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Visit Website',
        click() {
          /* To be implemented */
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: 'Ctrl+Cmd+I',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      }
    ]
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CommandOrControl+M',
        role: 'minimize'
      },
      { label: 'Close', accelerator: 'CommandOrControl+W', role: 'close' }
    ]
  }
]
if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [
      { label: `About ${name}`, role: 'about' },
      { type: 'separator' },
      { label: 'Services', role: 'services', submenu: [] },
      { type: 'separator' },
      { label: `Hide ${name}`, accelerator: 'Command+H', role: 'hide' },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      { label: 'Show All', role: 'unhide' },
      { type: 'separator' },
      {
        label: `Quit ${name}`,
        accelerator: 'Command+Q',
        click() {
          app.quit()
        }
      }
    ]
  })

  const windowMenu = template.find(item => item.label === 'Window')
  windowMenu.role = 'window'
  windowMenu.submenu.push(
    { type: 'separator' },
    { label: 'Bring All to Front', role: 'front' }
  )
}
module.exports = Menu.buildFromTemplate(template)
