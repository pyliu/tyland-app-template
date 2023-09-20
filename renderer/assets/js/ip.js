let tipv4 = ''
let tipv6 = ''
let all = []
// get all ip addresses by node.js os module 
const nets = require('os').networkInterfaces()
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    all.push(net.address)
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    if (net.family === 'IPv4' && !net.internal) {
        tipv4 = net.address
    } else if (net.family === 'IPv6' && !net.internal) {
        tipv6 = net.address
    }
  }
}

export const ipv4 = tipv4
export const ipv6 = tipv6
export const ips = all