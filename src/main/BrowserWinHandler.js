/* eslint-disable */
import { BrowserWindow, Menu, Tray, app, nativeImage } from 'electron'
import { EventEmitter } from 'events'
import path from 'path'
const DEV_SERVER_URL = process.env.DEV_SERVER_URL
const isProduction = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

export default class BrowserWinHandler {
  /**
   * @param [options] {object} - browser window options
   * @param [allowRecreate] {boolean}
   */
  constructor (options, allowRecreate = true) {
    this._eventEmitter = new EventEmitter()
    this.allowRecreate = allowRecreate
    this.options = options
    this.browserWindow = null
    this.tray = null
    this._createInstance()
  }

  _createInstance () {
    // make global single instance
    if (app.requestSingleInstanceLock()) {
      app.on('second-instance', (evt, cli, workingDir) => {
        this.showMainWindow()
      })
      // This method will be called when Electron has finished
      // initialization and is ready to create browser windows.
      // Some APIs can only be used after this event occurs.
      if (app.isReady()) this._create()
      else {
        app.once('ready', () => {
          this._create()
        })
      }
  
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (!this.allowRecreate) return
      app.on('activate', () => this._recreate())
    } else {
      app.quit()
    }
  }

  _create () {
    this.browserWindow = new BrowserWindow(
      {
        ...this.options,
        webPreferences: {
          ...this.options.webPreferences,
          webSecurity: isProduction, // disable on dev to allow loading local resources
          nodeIntegration: true, // allow loading modules via the require () function
          contextIsolation: false, // https://github.com/electron/electron/issues/18037#issuecomment-806320028
        }
      }
    )
    // disable the menu bar
    this.browserWindow.setMenuBarVisibility(false)
    
    this.browserWindow.on('focus', () => {
      // when browser window focused, set always on top attr to false
      this.browserWindow.setAlwaysOnTop(false)
      // stop flashing frame
      this.browserWindow.flashFrame(false)
    })

    // close to tray
    this.browserWindow.on('close', (event) => {
      event.returnValue = false
      event.preventDefault()
      this.browserWindow && this.browserWindow.hide()
    })

    this.browserWindow.on('closed', () => {
      // Dereference the window object
      this.browserWindow = null
    })
    
    this._createTray()

    this._eventEmitter.emit('created')
  }

  _createTray () {
    /**
     * Electron-nuxt (1.7.0) improves a global variable named process.resourcesPath (opens new window)
     * that will yield a proper path to the src/extraResources in renderer and main process. 
     * In this directory you can store all necessary resources with reliable path to them, 
     * but you must treat all assets in this directory as read only.
     * (If you need also write access, use app.getPath('appData') (opens new window)instead).
     */
    this.tray = new Tray(`${process.resourcesPath}/tray.ico`);
    this.tray.setToolTip(`tyland office helper ${app.getVersion()}`);
    this.tray.setContextMenu(Menu.buildFromTemplate([
      { 
        label: '關閉程式',
        click: () => { app.exit() },
        icon: nativeImage.createFromPath(path.join(process.resourcesPath, 'gartoon-stop.ico')).resize({ width: 16, height: 16 })
      },
    ]));
    this.tray.on('click', () => {
      // Do something when the tray icon is clicked.
      this.toogleMainWindow()
    });
    app.on('window-all-closed', () => {
      this.tray && this.tray.destroy()
    })
  }

  _recreate () {
    if (this.browserWindow === null) this._create()
  }

  /**
   * @callback onReadyCallback
   * @param {BrowserWindow}
   */

  /**
   *
   * @param callback {onReadyCallback}
   */
  onCreated (callback) {
    if (this.browserWindow !== null) return callback(this.browserWindow);
    this._eventEmitter.once('created', () => {
      callback(this.browserWindow)
    })
  }

  async loadPage(pagePath) {
    if (!this.browserWindow) return Promise.reject(new Error('The page could not be loaded before win \'created\' event'))
    const serverUrl = isDev ? DEV_SERVER_URL : 'app://./index.html'
    const fullPath = serverUrl + '#' + pagePath;
    await this.browserWindow.loadURL(fullPath)
  }

  /**
   *
   * @returns {Promise<BrowserWindow>}
   */
  created () {
    return new Promise(resolve => {
      this.onCreated(() => resolve(this.browserWindow))
    })
  }

  showMainWindow () {
    if (this.browserWindow) {
      this.browserWindow.flashFrame(true)
      this.browserWindow.isMinimized() && this.browserWindow.restore()
      this.browserWindow.setAlwaysOnTop(true)
      // show the window from hiding (tray)
      this.browserWindow.show()
      this.browserWindow.focus()
    }
  }

  hideMainWindow () {
    this.browserWindow && this.browserWindow.hide()
  }

  toogleMainWindow () {
    if (this.browserWindow) {
      this.browserWindow.isVisible() ? this.hideMainWindow() : this.showMainWindow()
    }
  }
}
