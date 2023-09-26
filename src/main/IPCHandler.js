const { ipcMain } = require('electron')

export default class IPCHandler {
  constructor () {
    ipcMain.handle('message', this._handleIncoming)
  }

  async _handleIncoming (message) {

  }
}
