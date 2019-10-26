const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const cheerio = require('cheerio');
var rp = require('request-promise');
var Queue = require('better-queue');

var q = new Queue(function (input, cb) {
    var $ = input.scope;
    var initialMessage = "Getting links";
    $.sendMessage(initialMessage, {
        parse_mode: "markdown",
        reply_to_message_id: $.message.messageId
    }).then(function (msg) {
        rp({
            method: 'GET',
            url: 'https://oppo-in.custhelp.com/app/soft_update'
        }, (err, res, body) => {
            if (err) return console.error(err);

            let instance = cheerio.load(body);

            // find individual device pages
            var link = [];
            instance('.item_img').each((i, el) => {
                const dl = instance(el).parent().attr('href');
                link.push("https://oppo-in.custhelp.com/"+dl);
            });

            // extract ota link from each page
            for (let i = 0; i < link.length; i++) {
                rp({
                    method: 'GET',
                    url: link[i]
                }, (err, res, body) => {
                    if (err) return console.error(err);

                    let linstance = cheerio.load(body);
                    var smessage = "";
                    var devicelist = [];
                    var deviceota = [];

                    linstance('.msg_tit').each((i, el) => {
                        const downloaddevice = linstance(el).html().replace("Latest Software Version for ","");
                        devicelist.push(downloaddevice);
                    });
                    linstance('#rn_SoftUpdate_18_download').each((i, el) => {
                        const downloadlink = linstance(el).attr('href');
                        deviceota.push(downloadlink);
                    });
                    for(let i = 0; i < devicelist.length; i++){
                        smessage += "[" + devicelist[i] + "](" + deviceota[i] + ")";
                    }
                    initialMessage = initialMessage + "\n" + smessage;
                    tg.api.editMessageText(initialMessage, {
                        parse_mode: "markdown",
                        chat_id: msg._chat._id,
                        disable_web_page_preview: false,
                        message_id: msg._messageId
                    }).catch(err => console.log(err));
                });
            }
        });
    });
}, {
    concurrent: 1,
    batchSize: 1
})

class OppoController extends TelegramBaseController {
    getFirmwares($) {
        q.push({
            scope: $,
            url: ""
        })
    }
    get routes() {
        return {
            'oppoHandler': 'getFirmwares',
        }
    }
}
module.exports = OppoController;

