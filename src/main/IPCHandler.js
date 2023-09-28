const { ipcMain, app } = require('electron')

export default class IPCHandler {
  constructor () {
    ipcMain.handle('invoke', this._handleInvoking)
  }

  async _handleInvoking (payload) {
    // this method is a dispatcher
    const type = payload.type
    switch (type) {
      case 'version':
        this.handleVersion(payload)
      default:
        console.warn(`${type} not supported!`)
    }
  }
  /**
   * handler impl
   */
  handleVersion (payload) {
    ipcMain.handle('version', async (event, payload) => {
      const version = app.getVersion()
      console.log(`APP version is`, version)
      return version
    })
  }
}
