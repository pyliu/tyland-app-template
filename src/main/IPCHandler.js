const { ipcMain } = require('electron')

export default class IPCHandler {
  constructor () {
    ipcMain.handle('invoke', this._handleInvoking)
  }

  async _handleInvoking (payload) {
    // this method is a dispatcher
    const type = payload.type
    switch (type) {
      default:
        console.warn(`${type} not supportrd`)
    }
  }
}
