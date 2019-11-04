const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const config = require("../config.js")

class BotStartController extends TelegramBaseController {
    botstart($) {
        $.sendMessage("[README](https://github.com/ShivamKumarJha/atbot/blob/master/README.md)" , {
            parse_mode: "markdown",
            disable_web_page_preview: "True",
            reply_to_message_id: $.message.messageId
        })
    }
    get routes() {
        return {
            'botstartHandler': 'botstart',
        }
    }
}
module.exports = BotStartController;
