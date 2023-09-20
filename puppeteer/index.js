const config = require('dotenv').config();
const path = require('path');
// https://www.npmjs.com/package/node-schedule
const schedule = require('node-schedule');
const puppeteer = require('puppeteer');
const readline = require('readline');
const isEmpty = require('lodash/isEmpty');

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

let todayAttendanceTime = '';

const CEHCK_TYPE_IDX = {
  IN: 1,
  OUT: 2,
  OIN: 3, // Overtime
  OOUT: 4 // Overtime
};

const findNewOpenedPage = async (browser, currentPage) => {
  const pageTarget = page.target();
  // find new opened page
  const newTarget = await browser.waitForTarget(
    (target) => target.opener() === pageTarget
  )
  return await newTarget.page();
}

const hitCheckButton = async (browser, page, index) => {
  // will go to another page(tab)
  await page.click('button#attendanceCardButton');
  // find new opened page
  const attendanceCardPage = findNewOpenedPage(browser, page);
  
  // TODO: find the timer text and return after delay(2000)

  // locate the target button
  const selector = `#cardbtnArea > input:nth-child(${index})`;
  await attendanceCardPage.waitForSelector(selector);
  await attendanceCardPage.click(selector);
  // wait sometime before close
  await delay(2000);
}


const isProd = process.env.NODE_ENV === 'production';
const notifier = require('node-notifier');
const reToastDelay = 5000;
const iconPath = path.join(__dirname, 'bell.png');
!isProd && console.log(`notification icon path`, iconPath);
const notify = function (message, title, callback) {
  notifier.notify(
    {
      appID: 'private.work.pyliu.app',
      title: title,
      message: message,
      icon: iconPath, // Absolute path (doesn't work on balloons)
      sound: true, // Only Notification Center or Windows Toasters
      wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
    },
    /*
      callback: function (err, response, metadata) {
        // Response is response from notification
        // Metadata contains activationType, activationAt, deliveredAt
      }
    */
    callback
  )
}

const ask  = () => {
  notify('✅開始上班?', '✨ 登入系統 ✨', async (err, response, metadata) => {
    // console.warn(err, response, metadata);
    if ('timeout' === response) {
      setTimeout(ask, reToastDelay);
      console.log('Re-toast 5s later ... ')
    } else if ('dismissed' === response) {
      console.log('Skip the operation!')
    } else {
      // user clicked the toast!
      // 1. check in
      checkIN();
      // 2. check out/oin
      // 3. check oout

      // const rl = readline.createInterface({
      //   input: process.stdin,
      //   output: process.stdout,
      // });
    
      // await rl.question('minutes? ', (ans) => {
      //   config.parsed.min = ans;
      //   console.warn(config);
      //   // Cron-style Scheduling
      //   // The cron format consists of:
      //   // *    *    *    *    *    *
      //   // ┬    ┬    ┬    ┬    ┬    ┬
      //   // │    │    │    │    │    │
      //   // │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
      //   // │    │    │    │    └───── month (1 - 12)
      //   // │    │    │    └────────── day of month (1 - 31)
      //   // │    │    └─────────────── hour (0 - 23)
      //   // │    └──────────────────── minute (0 - 59)
      //   // └───────────────────────── second (0 - 59, OPTIONAL)
      //   const cronConfig = '15 * * * * 0-7'
      //   console.log(`啟動排程 ${cronConfig}`)
      //   schedule.scheduleJob(cronConfig, checkOUTOOUT);
      //   rl.close();
      // });
    }
  });
}

const checkIN = async () => {
  console.log('check-in job started.')
  const browser = await puppeteer.launch({
    headless: false,
    // `headless: true` (default) enables old Headless;
    // `headless: 'new'` enables new Headless;
    // `headless: false` enables “headful” mode.
    slowMo: 150, // slow down by 250ms
    defaultViewport: null,
    args: ['--window-size=1280,800'],
    executablePath: config.parsed.executablePath
  });
  const page = await browser.newPage();
  // go to the URL
  await page.goto('https://webitr.tycg.gov.tw/WebITR/');
  await page.waitForNetworkIdle({
    idleTime: 1000,
    timeout: 5000
  });
  await page.type('#userName', config.parsed.user);
  await page.type('#login_key', config.parsed.pass);
  // login
  await page.click('button#sendBtn');
  await page.waitForNavigation();
  await page.waitForSelector('div.navsystem')
  // get today's attendance time text
  const weekday = new Date().getDay();
  const todayTimeSelector = `#tbl_attendance > tbody > tr:nth-child(${weekday + 1}) > td:nth-child(${weekday + 1}) > div`;
  todayAttendanceTime = await page.$eval(todayTimeSelector, el => el.textContent);
  console.log(`Today attendance time 👉 ${todayAttendanceTime}`);
  if (isEmpty(todayAttendanceTime)) {
    hitCheckButton(browser, page, CEHCK_TYPE_IDX.IN);
  }
  await browser.close();
}

(async () => {
  ask();
})();
