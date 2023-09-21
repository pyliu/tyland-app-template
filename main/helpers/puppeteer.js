const config = require('dotenv').config();
const path = require('path');
const puppeteer = require('puppeteer');
const isEmpty = require('lodash/isEmpty');
const { ipcMain } = require('electron');

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

let todayOnTime = [];
let todayOffTime = [];
let todayOvertimeOnTime = [];
let todayOvertimeOffTime = [];

const CEHCK_TYPE_IDX = {
  IN: 1,
  OUT: 2,
  OIN: 3, // Overtime
  OOUT: 4 // Overtime
};

const findNewOpenedPage = async (browser, currentPage) => {
  const pageTarget = currentPage.target();
  // find new opened page
  const newTarget = await browser.waitForTarget(
    (target) => target.opener() === pageTarget
  )
  return await newTarget.page();
}

const findNowClockTimeArray = async (page) => {
  const text = await page.$eval('#showbox', el => el.textContent);
  // record current time in hour/min parts
  // array, 0 => hour, 1 => minute
  return isEmpty(text) ? [] : text?.trim().split(':');
}

const hitCheckButton = async (browser, page, index) => {
  // will go to attendance card page(tab)
  await page.click('button#attendanceCardButton');
  // find new opened page
  const attendanceCardPage = findNewOpenedPage(browser, page);
  // find the timer text
  let times = findNowClockTimeArray(attendanceCardPage);
  const currentTime = `${times[0]}:${times[1]}`;
  
  console.log(`Current time => ${currentTime}`);
  ipcMain.send('add-message', `Current time => ${currentTime}`);

  if (times.length !== 2 || currentTime.length !== 5) {
    
    console.warn(`Can't find #showbox text string length is not 5. (expect XX:XX, got ${currentTime})`);
    ipcMain.send('add-message', `Can't find #showbox text string length is not 5. (expect XX:XX, got ${currentTime})`);

    await attendanceCardPage.close();
    return '';
  } else {
    // locate the target button
    const selector = `#cardbtnArea > input:nth-child(${index})`;
    await attendanceCardPage.waitForSelector(selector);
    if (index === CEHCK_TYPE_IDX.IN) {
      todayOnTime = [times[0], times[1]];
    } else if (index === CEHCK_TYPE_IDX.OUT) {
      if (isEmpty(todayOnTime)) {
        
        console.warn(`No today ON time record! Skip check-out action.`);
        ipcMain.send('add-message', `No today ON time record! Skip check-out action.`);
        
        await attendanceCardPage.close();
        return '';
      }
      // refresh times array if current server time approaches to 17
      while (parseInt(times[0]) === 16 && parseInt(times[1]) > 55) {

        console.warn(`Current is ${times[0]}:${times[1]}, wait to 17:00 ...`);
        ipcMain.send('add-message', `Current is ${times[0]}:${times[1]}, wait to 17:00 ...`);
        
        // wait for 1 minute
        await delay(60 * 1000);
        times = findNowClockTimeArray(attendanceCardPage);
      }
      const nowHour = parseInt(times[0]);
      if (nowHour < 17) {

        console.warn(`Current hour(${nowHour}) is less than 17! Skip check-out action.`);
        ipcMain.send('add-message', `Current hour(${nowHour}) is less than 17! Skip check-out action.`);
        
        await attendanceCardPage.close();
        return '';
      } else {
        const onHour = parseInt(todayOnTime[0]);
        const onMinutes = parseInt(todayOnTime[1]);
        if (onHour === 8 && onMinutes < 31) {
          // only 08:00 ~ 08:30 needs to check
          let nowMinutes = parseInt(times[1]);
          while (nowMinutes < onMinutes) {

            console.warn(`Current time is ${times[0]}:${times[1]}, waiting ...`);
            ipcMain.send('add-message', `Current time is ${times[0]}:${times[1]}, waiting ...`);
            
            // wait for 1 minute
            await delay(60 * 1000);
            times = findNowClockTimeArray(attendanceCardPage);
            nowMinutes = parseInt(times[1]);
          }

          console.warn(`Current time is ${times[0]}:${times[1]}, ready to go!`);
          ipcMain.send('add-message', `Current time is ${times[0]}:${times[1]}, ready to go!`);
        }
        todayOffTime = [times[0], times[1]];
      }
    } else if (index === CEHCK_TYPE_IDX.OIN) {
      if (isEmpty(todayOffTime)) {

        console.warn(`No today OFF time record! Skip check-oin action.`);
        ipcMain.send('add-message', `No today OFF time record! Skip check-oin action.`);
        
        await attendanceCardPage.close();
        return '';
      }
      // no other business
      todayOvertimeOnTime = [times[0], times[1]];
    } else if (index === CEHCK_TYPE_IDX.OOUT) {
      if (isEmpty(todayOvertimeOnTime)) {

        console.warn(`No today overtime ON time record! Skip check-oout action.`);
        ipcMain.send('add-message', `No today overtime ON time record! Skip check-oout action.`);
        
        await attendanceCardPage.close();
        return '';
      }
      todayOvertimeOffTime = [times[0], times[1]];
    }
    await attendanceCardPage.click(selector);
    // TODO: use waitForSelector should be better ...
    // wait sometime before close
    await delay(5000);
  }
  await attendanceCardPage.close();
  return currentTime;
}

const checkIN = async (params = {}) => {
  const merged = {
    ...{
      // `headless: true` (default) enables old Headless;
      // `headless: 'new'` enables new Headless;
      // `headless: false` enables “headful” mode.
      headless: false,
      slowMo: 100,
      args: ['--window-size=1280,800'],
      executablePath: config.parsed.executablePath
    },
    ...params
  }

  console.log('check-in process started.');
  ipcMain.send('add-message', 'check-in process started.');

  const browser = await puppeteer.launch(merged);
  const page = await browser.newPage();
  // go to the URL
  await page.goto(config.parsed.url);
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
  const todayTimeSelector = `#tbl_attendance > tbody > tr:nth-child(${weekday + 1}) > td:nth-child(2)`;
  const todayAttendanceTime = await page.$eval(todayTimeSelector, el => el.textContent);

  console.log(`Detected today's attendance time => ${todayAttendanceTime}`);
  ipcMain.send('add-message', `Detected today's attendance time => ${todayAttendanceTime}`);
  
  if (isEmpty(todayAttendanceTime)) {
    const hitTime = await hitCheckButton(browser, page, CEHCK_TYPE_IDX.IN);

    console.log(`Hit IN time => ${hitTime}`);
    ipcMain.send('add-message', `Hit IN time => ${hitTime}`);
    
  } else {
    const parts = todayAttendanceTime.split(':');
    // 0 => hour, 1 => minute
    todayOnTime = [parts[0], parts[1]];
  }
  await browser.close();
}

const checkOUTOIN = async (username, password, params = {}) => {
  const merged = {
    ...{
      // `headless: true` (default) enables old Headless;
      // `headless: 'new'` enables new Headless;
      // `headless: false` enables “headful” mode.
      headless: false,
      slowMo: 100,
      args: ['--window-size=1280,800'],
      executablePath: config.parsed.executablePath
    },
    ...params
  }

  console.log('check-out/oin process started.');
  ipcMain.send('add-message', 'check-out/oin process started.');
  
  const browser = await puppeteer.launch(merged);
  const page = await browser.newPage();
  // go to the URL
  await page.goto(config.parsed.url);
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
  const todayTimeSelector = `#tbl_attendance > tbody > tr:nth-child(${weekday + 1}) > td:nth-child(2)`;
  const todayAttendanceTime = await page.$eval(todayTimeSelector, el => el.textContent);

  console.log(`Detected today's attendance time => ${todayAttendanceTime}`);
  ipcMain.send('add-message', `Detected today's attendance time => ${todayAttendanceTime}`);
  
  if (isEmpty(todayAttendanceTime)) {

    console.log(`No today's attendance time, skip the rest process.`);
    ipcMain.send('add-message', `No today's attendance time, skip the rest process.`);
    
  } else {
    const offTime = await hitCheckButton(browser, page, CEHCK_TYPE_IDX.OUT);

    console.log(`Hit OFF time => ${offTime}`);
    ipcMain.send('add-message', `Hit OFF time => ${offTime}`);
    
    const overtimeInTime = await hitCheckButton(browser, page, CEHCK_TYPE_IDX.OIN);

    console.log(`Hit overtime IN time => ${overtimeInTime}`);
    ipcMain.send('add-message', `Hit overtime IN time => ${overtimeInTime}`);
    
  }
  await browser.close();
}

const checkOOUT = async (username, password, params = {}) => {
  const merged = {
    ...{
      // `headless: true` (default) enables old Headless;
      // `headless: 'new'` enables new Headless;
      // `headless: false` enables “headful” mode.
      headless: false,
      slowMo: 100,
      args: ['--window-size=1280,800'],
      executablePath: config.parsed.executablePath
    },
    ...params
  }

  console.log('check-oout process started.')
  ipcMain.send('add-message', 'check-oout process started.');
  
  const browser = await puppeteer.launch(merged);
  const page = await browser.newPage();
  // go to the URL
  await page.goto(config.parsed.url);
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
  const todayOffTimeSelector = `#tbl_attendance > tbody > tr:nth-child(${weekday + 1}) > td:nth-child(3)`;
  const todayOffTime = await page.$eval(todayOffTimeSelector, el => el.textContent);

  console.log(`Detected today's off time => ${todayOffTime}`);
  ipcMain.send('add-message', `Detected today's off time => ${todayOffTime}`);
  
  if (isEmpty(todayOffTime)) {

    console.log(`No today's off time, skip the rest process.`);
    ipcMain.send('add-message', `No today's off time, skip the rest process.`);
    
  } else {
    const overtimeOutTime = await hitCheckButton(browser, page, CEHCK_TYPE_IDX.OOUT);

    console.log(`Hit overtime OUT time => ${overtimeOutTime}`);
    ipcMain.send('add-message', `Hit overtime OUT time => ${overtimeOutTime}`);
    
  }
  await browser.close();
}

export {
  checkIN, checkOOUT, checkOUTOIN
};

