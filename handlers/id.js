const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const config = require("../config.js")

class IdController extends TelegramBaseController {

    id($) {
        $.sendMessage($.message.chat.id, {
            parse_mode: "markdown",
            reply_to_message_id: $.message.messageId
        })
    }
    get routes() {
        return {
            'idHandler': 'id',
        }
    }
}

module.exports = IdController;
