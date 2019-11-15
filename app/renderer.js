const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')
const marked = require('marked')
const markdownView = document.querySelector('#markdown')
const htmlView = document.querySelector('#html')
const newFileButton = document.querySelector('#new-file')
const openFileButton = document.querySelector('#open-file')
const saveMarkdownButton = document.querySelector('#save-markdown')
const revertButton = document.querySelector('#revert')
const saveHtmlButton = document.querySelector('#save-html')
const showFileButton = document.querySelector('#show-file')
const openInDefaultButton = document.querySelector('#open-in-default')
const path = require('path')

const currentWindow = remote.getCurrentWindow()

let filePath = null
let originalContent = ''

const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown)
}

const updateUserInterface = isEdited => {
  let title = 'Fire Sale'
  if (filePath) {
    title = `${path.basename(filePath)} - ${title}`
  }
  if (isEdited) {
    title = `${title} (Edited)`
  }
  currentWindow.setTitle(title)
  currentWindow.setDocumentEdited(isEdited)

  saveMarkdownButton.disabled = !isEdited
  revertButton.disabled = !isEdited
}

markdownView.addEventListener('keyup', event => {
  const currentContent = event.target.value
  renderMarkdownToHtml(currentContent)
  updateUserInterface(currentContent !== originalContent)
})

openFileButton.addEventListener('click', () => {
  mainProcess.getFileFromUser(currentWindow)
})

ipcRenderer.on('file-opened', (event, file, content) => {
  filePath = file
  originalContent = content
  markdownView.value = content
  renderMarkdownToHtml(content)

  updateUserInterface()
})

newFileButton.addEventListener('click', () => {
  mainProcess.createWindow()
})
