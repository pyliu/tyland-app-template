const { ipcMain, app } = require('electron')

export default class IPCHandler {
  constructor () {
    ipcMain.handle('command', this._handleCommand.bind(this))
  }

  async _handleCommand (event, payload) {
    console.olog(payload)
    // this method is a dispatcher
    const type = payload.type
    switch (type) {
      case 'open-browser':
        return this.handleOpenBrowser(payload)
      case 'version':
        return this.handleVersion(payload)
      default:
        console.warn(`${type} not supported!`)
        return `${type} not supported!`
    }
  }
  /**
   * handler impl
   */
  handleVersion (payload) {
    const version = app.getVersion()
    console.log(`APP version is ${version}`)
    return version
  }

  handleOpenBrowser (payload) {
    const url = payload.url || payload.path || payload
    console.log(`exec => start "" "${url}"`)
    // use default browser to open the url
    require('child_process').exec(`start "" "${url}"`)
    return true
  }
}
