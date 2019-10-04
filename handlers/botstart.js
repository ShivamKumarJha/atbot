const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const config = require("../config.js")

class BotStartController extends TelegramBaseController {
    botstart($) {
        $.sendMessage(
            "/bloblist <Raw URL of allfiles.txt>\n" +
            "_Generates proprietary-files.txt_" +
            "\n\n/blobs <OTA URL>\n" +
            "_Pushes proprietary blobs to _[AndroidBlobs](https://github.com/AndroidBlobs)" +
            "\n\n/ddt <OTA URL>\n" +
            "_Creates a _[Dummy_DT](https://github.com/ShivamKumarJha/Dummy_DT)" +
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
            "\n\n/op <codename>\n" +
            "_OnePlus OTA downloads._" +
            "\n\n/twrp <codename>\n" +
            "_TWRP download._" +
            "\n\n/xiaomi <codename>\n" +
            "_Xiaomi OTA download._" +
            "\n\n/id \n_Chat Id_" , {
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
