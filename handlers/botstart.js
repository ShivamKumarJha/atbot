const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const config = require("../config.js")

class BotStartController extends TelegramBaseController {
    botstart($) {
        $.sendMessage(
            "/bloblist <Raw URL of allfiles.txt>\n" +
            "_Generates proprietary-files.txt_" +
            "\n\n/ddt <OTA URL>\n" +
            "_Creates a _[Dummy_DT](https://github.com/ShivamKumarJha/Dummy_DT)" +
            "\n\n/dall <OTA URL>\n" +
            "_/ddt + /dump._" +
            "\n\n/dump <OTA URL>\n" +
            "_Pushes ROM dump to _[AndroidDumps](https://github.com/AndroidDumps)" +
            "\n\n/gdrive <URL>\n" +
            "_Generates direct download link for gdrive._" +
            "\n\n/caf <TAG OR PLATFORM>\n" +
            "_Find latest caf tag._" +
            "\n\n/deviceinfos <codename>\n" +
            "_Show device information._" +
            "\n\n/specs <codename>\n" +
            "_Shows device specs._" +
            "\n\n/codename <brand device>\n" +
            "_Shows device specs._" +
            "\n\n/gapps <codename>\n" +
            "_Various latest gapps links._" +
            "\n\n/oneplus <codename>\n" +
            "_OnePlus OTA links._" +
            "\n\n/oppo\n" +
            "_Oppo OTA links._" +
            "\n\n/realme\n" +
            "_Realme OTA links._" +
            "\n\n/twrp <codename>\n" +
            "_TWRP links._" , {
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
