const path = require('path');
const notifier = require('node-notifier');
const debounce = require('lodash/debounce');

const isProd = process.env.NODE_ENV === 'production';
const iconPath = path.join(__dirname, 'bell.png');
!isProd && console.log(`notification icon path`, iconPath);

const notify = function (message, title, callback) {
  notifier.notify(
    {
      appID: '⚠️通知',
      title: title ,
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

const notifyDebounced = debounce(notify, 5000);
  

export {
  notifier,
  notify,
  notifyDebounced
};
