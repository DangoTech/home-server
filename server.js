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
  } else {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Suspicious activity.  Your IP has been noted.');

    let fileIndex = Math.floor(count++ / NUMBER_OF_IP_PER_FILE);
    fs.appendFile('suspicious' + fileIndex + '.txt', requestIP.replace(/\"/g, '') + '\r\n');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});