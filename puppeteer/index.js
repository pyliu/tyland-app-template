const config = require('dotenv').config();
const path = require('path');
// https://www.npmjs.com/package/node-schedule
const schedule = require('node-schedule');
const puppeteer = require('puppeteer');
const readline = require('readline');

const isProd = process.env.NODE_ENV === 'production';
const notifier = require('node-notifier');
const reToastDelay = 5000;
const iconPath = path.join(__dirname, 'bell.png');
!isProd && console.log(`notification icon path`, iconPath);
const notify = function (message, title, callback) {
  notifier.notify(
    {
      appID: 'private.work.tycg.app',
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
      doJob();
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
      //   schedule.scheduleJob(cronConfig, doJob);
      //   rl.close();
      // });
    }
  });
}

const doJob = async () => {
  console.log('scheduled job started.')
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
  const pageTarget = page.target();
  await page.waitForNetworkIdle({
    idleTime: 1000,
    timeout: 5000
  });
  await page.type('#userName', config.parsed.user);
  await page.type('#login_key', config.parsed.pass);
  await page.screenshot({path: 'login.png'});
  await page.click('button#sendBtn');
  // await page.pdf({path: 'google.pdf'});
  await page.waitForNavigation();
  await page.waitForSelector('div.navsystem')
  await page.screenshot({path: 'main.png'});
  // will go to another page(tab)
  await page.click('button#attendanceCardButton');
  // fin new opened page
  const newTarget = await browser.waitForTarget(
    (target) => target.opener() === pageTarget
  )
  const attendanceCardPage = await newTarget.page()
  console.log(`wait 👉 #showbox`);
  await attendanceCardPage.waitForSelector('#showbox');
  // console.log(resolved);
  // //*[@id="search_keyword"]
  // use the tabs Page objects properly
  // console.log("Tab Two Title ",await tabTwo.title());
  await attendanceCardPage.screenshot({path: 'attendanceCardPage.png'});
  // #showbox
  const nowTs = await attendanceCardPage.$eval('#showbox', el => el.textContent);
  // const inputsBtns = await tabTwo.$$eval('#cardbtnArea > input', inputs => {
  //   return inputs.map(input => input)
  // })
  console.warn(nowTs);
  
  await attendanceCardPage.waitForSelector('#cardbtnArea');
  const result = await attendanceCardPage.evaluate(() => {
    let data = []; // Create an empty array that will store our data
    let elements = document.querySelectorAll('#cardbtnArea > input'); // Select all Products

    for (var element of elements) { // Loop through each proudct
      let v = element.value; // Select the title
      data.push({ element, v }); // Push an object with the data onto our array
    }

    return data; // Return our data array
  });

  console.warn(result);

  await browser.close();
}

(async () => {
  ask();
  // doJob();
})();
