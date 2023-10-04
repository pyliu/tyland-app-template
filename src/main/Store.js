const electron = require('electron');
const fse = require('fs-extra');
const path = require('path');

class Store {
  constructor(opts = {
    configName: 'user-preferences',
    defaults: {}
  }) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(userDataPath, opts.configName + '.json');
    if (!fse.pathExistsSync(this.path)) {
      fse.writeJsonSync(this.path, opts.defaults);
    }
    this.data = fse.readJsonSync(this.path);
  }
  
  get(key) {
    return this.data[key];
  }
  
  set(key, val) {
    this.data[key] = val;
    fse.writeJsonSync(this.path, this.data);
  }
}

// expose the class
module.exports = Store;
