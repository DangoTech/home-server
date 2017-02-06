'use strict';

const fs = require('fs');
const http = require('http');
const ip = require('ip');
const rangeCheck = require('range_check');

const awsIP = require('./aws-ip');
const serverConfig = require('./config/serverConfig.json');

const hostname = ip.address();
const port = serverConfig.serverPort;

const acceptableIPs = awsIP.getIPsFromServer({ region : serverConfig.awsRegion, service : serverConfig.awsService});

let count = 0;
const NUMBER_OF_IP_PER_FILE = 100;

const server = http.createServer((req, res) => {
  let requestIP = JSON.stringify(req.connection.remoteAddress);
  if (rangeCheck.inRange(requestIP, acceptableIPs)) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
    startKissGoodnight();
  } else {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Suspicious activity.  Your IP has been noted.');

    let fileIndex = Math.floor(count++ / NUMBER_OF_IP_PER_FILE);
    fs.appendFile(serverConfig.logFolder + 'suspicious_' + process.pid + '_' + fileIndex + '.txt', new Date().toISOString() + ': ' + requestIP.replace(/\"/g, '') + '\r\n');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function startKissGoodnight() {
  let TPLinkLB130 = require('tp-link-lb130');
  let lb130 = new TPLinkLB130('192.168.1.70');

  lb130.getStatus()
    .then((onState) => {
      lb130.changeColor(100, 0, 0, 1000);

      let step = 0;
      let interval = setInterval(() => {

        if (step < 29) {
          let colorWheelDeg = 360*((step%6)/6);
          console.log(`deg: ${colorWheelDeg} | steps: ${step}`);
          lb130.changeColor(50, colorWheelDeg, 50, 750);
        }

        if (step === 30) {
          // reset to original state
          lb130.changeColor(onState.brightness, onState.hue, onState.saturation, 750);
        }

        if (step > 30) {
          // gradual turn off
          lb130.turnOff(3000);
          clearInterval(interval);
        }

        step++;
      }, 1000);

    });
}