(function() {
  'use strict';

  // https://ip-ranges.amazonaws.com/ip-ranges.json
  const awsIPsJson = require('./ip-ranges.json');

  exports.getIPsFromServer = function (serverOptions) {
    if (awsIPsJson && awsIPsJson.prefixes) {
      return awsIPsJson.prefixes.filter(prefix => {
        return serverOptions.region ? prefix.region === serverOptions.region : prefix;
      }).filter(prefix => {
          return serverOptions.service ? prefix.service === serverOptions.service : prefix;
      }).map(prefix => {
        // currently ignores ipv6
        return prefix.ip_prefix;
      });
    }
  };
})();