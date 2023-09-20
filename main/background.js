import { app } from 'electron';
import serve from 'electron-serve';

const path = require('path')
const qs = require('qs');
const axios = require('axios')
// required for PHP backend
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

import {
  createWindow,
  exitOnChange,
  notify
} from './helpers';

const isProd = process.env.NODE_ENV === 'production';
// current executable file path
const exePath = app.getPath('exe');
// TODO: load config file ...
notify(exePath);
console.log('exePath', exePath);

let mainWindow = null;
let tray = null;

const closeApp = function () {
  tray && tray.destroy();
  app.isQuiting = true;
  // send to renderer process
  mainWindow && mainWindow.webContents.send('quit');
  app.quit();
}

if (isProd) {
  serve({ directory: 'app' });
} else {
  exitOnChange();
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
  // notify('TEST', );
})();

app.on('window-all-closed', closeApp);
