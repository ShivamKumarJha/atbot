const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const BotUtils = require('../utils')
const cheerio = require('cheerio');
const request = require('request');

class OppoController extends TelegramBaseController {

    getFirmwares($) {

        request({
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
                request({
                    method: 'GET',
                    url: link[i]
                }, (err, res, body) => {
                    if (err) return console.error(err);

                    let linstance = cheerio.load(body);
                    var smessage = "";
                    var devicelist = [];
                    var deviceota = [];

                    linstance('.msg_tit').each((i, el) => {
                        const downloaddevice = linstance(el).html().replace("Latest Software Version for ","");;
                        devicelist.push(downloaddevice);
                    });
                    linstance('#rn_SoftUpdate_18_download').each((i, el) => {
                        const downloadlink = linstance(el).attr('href');
                        deviceota.push(downloadlink);
                    });
                    for(let i = 0; i < devicelist.length; i++){
                        smessage += "[" + devicelist[i] + "](" + deviceota[i] + ")";
                    }
                    console.log(smessage);
                    $.sendMessage(smessage, {
                        parse_mode: "markdown",
                        reply_to_message_id: $.message.messageId
                    }).catch(err => console.log(err))
                });
            }

        });
    }

    get routes() {
        return {
            'oppoHandler': 'getFirmwares',
        }
    }
}

module.exports = OppoController;
