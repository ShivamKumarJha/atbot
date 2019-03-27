const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const config = require("../config.js")
var mongojs = require('mongojs')
var db = mongojs(config.db.name)
var motoFirmwares = db.collection('moto')
const request = require('request')

class AsusController extends TelegramBaseController {

    getFirmwares($) {

        if (!$.command.success || $.command.arguments.length === 0) {
            $.sendMessage("Usage: /asus _keywords_\n*Ex.:* /asus ZS600KL", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            });
            return;
        }

        request.get("https://www.asus.com/support/api/product.asmx/GetPDLevel?website=global&type=1&typeid=1&productflag=1",
            function (error, response, body) {

                var json = JSON.parse(body)

                var query = $.command.arguments.join(" ");

                if (json.Result.Product && json.Result.Product.length > 0) {
                    var pattern = '^'

                    $.command.arguments.forEach(function (element) {
                        pattern += '(?=.*' + element + ')'
                    })

                    pattern += '.*$'

                    var deviceMatch = new RegExp(pattern, 'gi')

                    var device = json.Result.Product.filter(product => deviceMatch.test(product.PDName));

                    if (device && device.length > 0) {
                        console.log(device)

                        request.get("https://www.asus.com/support/api/product.asmx/GetPDDrivers?cpu=&osid=32&website=global&pdhashedid=" + device[0].PDHashedId,
                            function (error, response, body) {

                                var result = JSON.parse(body).Result
                                var firmwares;

                                if (result && result.Obj && result.Obj.length > 0) {

                                    result.Obj.forEach(function (type) {
                                        if (type.Name === "Firmware") {
                                            firmwares = type;
                                        }
                                    })

                                    if (firmwares && firmwares.Files && firmwares.Files.length > 0) {
                                        var msg = "*Firmware found for " + device[0].PDName + " *\n\n"
                                        var filesLength = firmwares.Files.length > 3 ? 3 : firmwares.Files.length
                                        for (var i = 0; i < filesLength; i++) {
                                            var linkTitle = firmwares.Files[i].DownloadUrl.Global.split("/")[firmwares.Files[i].DownloadUrl.Global.split("/").length - 1]
                                            msg += "[" + linkTitle + "](" + firmwares.Files[i].DownloadUrl.Global + ")\n";
                                            msg += "*" + firmwares.Files[i].FileSize + " - Released date: " + firmwares.Files[i].ReleaseDate + "*\n\n"
                                        }

                                        console.log(msg)

                                        $.sendMessage(msg, {
                                            parse_mode: "markdown",
                                            reply_to_message_id: $.message.messageId
                                        });

                                    } else {
                                        $.sendMessage("*No firmware found*", {
                                            parse_mode: "markdown",
                                            reply_to_message_id: $.message.messageId
                                        });
                                    }
                                }
                            })
                    } else {
                        $.sendMessage("*Device not found*", {
                            parse_mode: "markdown",
                            reply_to_message_id: $.message.messageId
                        });
                    }

                }
            });

    }

    get routes() {
        return {
            'asusHandler': 'getFirmwares',
        }
    }
}

module.exports = AsusController;
