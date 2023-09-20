const config = require('dotenv').config();
const path = require('path');
const puppeteer = require('puppeteer');
const isEmpty = require('lodash/isEmpty');

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// let todayAttendanceTime = '';

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

const hitCheckButton = async (browser, page, index) => {
  let currentTime = '';
  // will go to another page(tab)
  await page.click('button#attendanceCardButton');
  // find new opened page
  const attendanceCardPage = findNewOpenedPage(browser, page);
  // locate the target button
  const selector = `#cardbtnArea > input:nth-child(${index})`;
  await attendanceCardPage.waitForSelector(selector);
  await attendanceCardPage.click(selector);
  // find the timer text
  const tmp = await attendanceCardPage.$eval('#showbox', el => el.textContent);
  if (isEmpty(tmp)) {
    console.warn('Can\'t find #showbox text');
  } else {
    const parts = tmp.split(':');
    currentTime = `${parts[0]}:${parts[1]}`
    console.log(`Current time 👉 ${currentTime}`);
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
  console.log('check-in process started.')
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
  console.log(`Detected today's attendance time 👉 ${todayAttendanceTime}`);
  if (isEmpty(todayAttendanceTime)) {
    const hitTime = await hitCheckButton(browser, page, CEHCK_TYPE_IDX.IN);
    console.log(`Hit IN time 👉 ${hitTime}`);
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
  console.log('check-out/oin process started.')
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
  console.log(`Detected today's attendance time 👉 ${todayAttendanceTime}`);
  if (isEmpty(todayAttendanceTime)) {
    console.log(`No today's attendance time, skip the rest process.`);
  } else {
    const offTime = await hitCheckButton(browser, page, CEHCK_TYPE_IDX.OUT);
    console.log(`Hit OFF time 👉 ${offTime}`);
    const overtimeInTime = await hitCheckButton(browser, page, CEHCK_TYPE_IDX.OIN);
    console.log(`Hit overtime IN time 👉 ${overtimeInTime}`);
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
  console.log(`Detected today's off time 👉 ${todayOffTime}`);
  if (isEmpty(todayOffTime)) {
    console.log(`No today's off time, skip the rest process.`);
  } else {
    const overtimeOutTime = await hitCheckButton(browser, page, CEHCK_TYPE_IDX.OOUT);
    console.log(`Hit overtime OUT time 👉 ${overtimeOutTime}`);
  }
  await browser.close();
}

export {
  checkIN, checkOOUT, checkOUTOIN
};

