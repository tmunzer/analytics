var https = require('https');

/**
 * HTTP GET Request
 * @param {String} authCode - Code sent by ACS during OAuth process
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectUrl - Aerohive Developper Account redirectUrl
 *  */
module.exports.getPermanentToken = function(authCode, devAccount, callback){
    var options = {
        host: 'cloud.aerohive.com',
        port: 443,
        path: '/services/acct/thirdparty/accesstoken?authCode='+authCode+'&redirectUri='+devAccount.redirectUrl,
        method: 'POST',
        headers: {
            'X-AH-API-CLIENT-SECRET' : devAccount.clientSecret,
            'X-AH-API-CLIENT-ID': devAccount.clientID,
            'X-AH-API-CLIENT-REDIRECT-URI': devAccount.redirectUrl
        }
    };

    var req = https.request(options, function(res) {
        console.info('\x1b[34mREQUEST QUERY\x1b[0m:', options.path);
        console.info('\x1b[34mREQUEST STATUS\x1b[0m:',result.result.status);
        res.setEncoding('utf8');
        res.on('data', function (data) {
            callback(JSON.parse(data));
        });
    });

    req.on('error', function(err) {
        console.error("\x1b[31mREQUEST QUERY\x1b[0m:", options.path);
        console.error("\x1b[31mREQUEST ERROR\x1b[0m:", JSON.stringify(err));
        callback(err, null);
    });

// write data to request body
    req.write('data\n');
    req.end();
};

