var rp = require('request-promise');

BotUtils = {}

BotUtils.getJSON = (url, cb) => {
    rp(url, {
            json: true,
            resolveWithFullResponse: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0",
            }
        }).then(function (response) {
            if (response.statusCode !== 200)
                return;

            if (response.headers['content-type'].indexOf('application/json') === -1) {

                if (response.headers['content-type'].indexOf("text/plain") !== -1 ||
                    response.headers['content-type'].indexOf("text/html") !== -1) {
                    try {
                        if (typeof response.body === "object") {
                            cb(response.body)
                        } else {
                            var json = JSON.parse(response.body);
                            cb(json)
                        }
                    } catch (e) {
                        //console.log(response.body)
                    }
                }
                return;
            }

            cb(response.body)
        })
        .catch(function (err) {
            console.log(err)
            //cb(null, err)
        });
}

BotUtils.humanFileSize = (bytes, si) => {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
}

module.exports = BotUtils
