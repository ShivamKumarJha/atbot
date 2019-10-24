const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const cheerio = require('cheerio');
const request = require('request');

class RealmeController extends TelegramBaseController {

    getFirmwares($) {

        request({
            method: 'GET',
            url: 'https://www.realme.com/in/support/software-update'
        }, (err, res, body) => {
            if (err) return console.error(err);

            let instance = cheerio.load(body);
            var realmelinks = "Global ROMs\n";

            instance('.software-button').each((i, el) => {
                const item = instance(el).attr('title').replace(" Software Download","");
                const link = instance(el).attr('data-href');
                realmelinks += "[" + item + "](" + link + ")\n";
            });
            //console.log(realmelinks);
            $.sendMessage(realmelinks, {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            }).catch(err => console.log(err))
        });

        request({
            method: 'GET',
            url: 'https://www.realme.com/cn/support/software-update'
        }, (err, res, body) => {
            if (err) return console.error(err);

            let instance = cheerio.load(body);
            var realmelinks = "China ROMs\n";

            instance('.software-button').each((i, el) => {
                const item = instance(el).attr('title').replace(" Software Download","");
                const link = instance(el).attr('data-href');
                realmelinks += "[" + item + "](" + link + ")\n";
            });
            //console.log(realmelinks);
            $.sendMessage(realmelinks, {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            }).catch(err => console.log(err))
        });
    }

    get routes() {
        return {
            'realmeHandler': 'getFirmwares',
        }
    }
}

module.exports = RealmeController;
