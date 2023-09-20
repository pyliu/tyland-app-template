import { app } from 'electron';
import serve from 'electron-serve';
import {
  checkIN,
  checkOUTOIN,
  createWindow,
  exitOnChange,
  notify
} from './helpers';

const schedule = require('node-schedule');
// const path = require('path')
// const qs = require('qs');
// const axios = require('axios')
// // required for PHP backend
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
const isProd = process.env.NODE_ENV === 'production';
// current executable file path
const exePath = app.getPath('exe');
// TODO: load config file ...
console.log('exePath', exePath);

let mainWindow = null;
let tray = null;

const closeApp = function () {
  // send to renderer process
  mainWindow && mainWindow?.webContents.send('quit');
  tray && tray.destroy();
  app.isQuiting = true;
  app.quit();
}

if (isProd) {
  serve({ directory: 'app' });
} else {
  exitOnChange();
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

app.on('window-all-closed', closeApp);

const reToastDelay = 5000;
const askCheckIN  = () => {
  notify('✅開始上班?', '✨ 登入系統 ✨', async (err, response, metadata) => {
    // console.warn(err, response, metadata);
    if ('timeout' === response) {
      setTimeout(askCheckIN, reToastDelay);
      console.log('Re-toast 5s later ... ')
    } else if ('dismissed' === response) {
      console.log('Skip the operation!')
    } else {
      // user clicked the toast!
      // 1. check in
      checkIN();
      // 2. check out/oin
      // 3. check oout
    }
  });
}

// main ...
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
  // ask for check-in data
  askCheckIN();
  // scheduled for check out/oin
  // Cron-style Scheduling
  // The cron format consists of:
  // *    *    *    *    *    *
  // ┬    ┬    ┬    ┬    ┬    ┬
  // │    │    │    │    │    │
  // │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
  // │    │    │    │    └───── month (1 - 12)
  // │    │    │    └────────── day of month (1 - 31)
  // │    │    └─────────────── hour (0 - 23)
  // │    └──────────────────── minute (0 - 59)
  // └───────────────────────── second (0 - 59, OPTIONAL)
  const cronConfig = '5 */1 17 * * 1-6';
  console.log(`start check-out/oin job 👉 ${cronConfig}`);
  schedule.scheduleJob(cronConfig, checkOUTOIN);
})();
