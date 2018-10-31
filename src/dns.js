const dns = require('dns');
const { promisify } = require('util');

module.exports = {
    dnsLookup: promisify(dns.lookup),
    dnsResolve6: promisify(dns.resolve6)
};
