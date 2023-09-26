import BrowserWinHandler from './BrowserWinHandler'

const winHandler = new BrowserWinHandler({
  height: 600,
  width: process.env.NODE_ENV === 'production' ? 450 : 900,
  show: false,  // use 'ready-to-show' event to show the window
  useContentSize: true, // include window frame/menubar size
  center: true,
  resizable: false,
  maximizable: false,
})

winHandler.onCreated(_browserWindow => {
  winHandler.loadPage('/')
  // Or load custom url
  // _browserWindow.loadURL('https://google.com')
})

export default winHandler
