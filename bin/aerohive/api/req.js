var https = require('https');
var ApiConf = require(appRoot + "/bin/aerohive/config");


module.exports.apiRequest = function (vpcUrl, accessToken, path, callback) {

    var result = {};
    result.request = {};
    result.result = {};
    var options = {
        host: vpcUrl,
        port: 443,
        path: path,
        method: 'GET',
        headers: {
            'X-AH-API-CLIENT-SECRET': ApiConf.secret,
            'X-AH-API-CLIENT-ID': ApiConf.clientId,
            'X-AH-API-CLIENT-REDIRECT-URI': ApiConf.redirectUrl,
            'Authorization': "Bearer " + accessToken
        }
    };
    console.info(options);
    result.request.options = options;
    var req = https.request(options, function (res) {
        result.result.status = res.statusCode;
        console.info('STATUS: ' + result.result.status);
        result.result.headers = JSON.stringify(res.headers);
        console.info('HEADERS: ' + result.result.headers);
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            if (data != '') {
                var dataJSON = JSON.parse(data);
                result.data = dataJSON.data;
                result.error = dataJSON.error;
            }
            switch (result.result.status) {
                case 200:
                    callback(null, result);
                    break;
                default:
                    console.error(result);
                    callback(result.error, result);
                    break;

            }
        });
    });
    req.on('error', function (err) {
        callback(err, null);
    });


// write data to request body
    req.write('data\n');
    req.end();


};
