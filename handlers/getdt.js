const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const BotUtils = require('../utils')
var rp = require('request-promise');

class GetdtController extends TelegramBaseController {

    async getDt($) {
        if (!$.command.success || $.command.arguments.length === 0) {
            $.sendMessage("Usage: /getdt device", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            });
            return;
        }

        this.checkDeviceTree("https://api.github.com/orgs/AndroidBlobs/repos", $);

    }

    async checkDeviceTree(url, $) {

        var options = {
            json: true,
            resolveWithFullResponse: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0",
                "Accept": "application/vnd.github.cloak-preview"
            }
        }

        var repos = await rp.get(url, options);
        var result = repos.body;
        var itemFound = false;

        if (!result || result.length === 0)
            return

        for (let item of result) {
            if (item.name.indexOf($.command.arguments[0]) !== -1) {
                itemFound = true;
                this.sendDtMessage($, item);
                break;
            }
        }

        if (itemFound)
            return
        var currentPage
        if (url.indexOf("page=") === -1) {
            currentPage = 2;
        } else {
            currentPage = parseInt(url.split("page=")[1]);
            currentPage = currentPage + 1
        }
        await this.checkDeviceTree("https://api.github.com/orgs/AndroidBlobs/repos?page=" + currentPage, $);
    }

    async sendDtMessage($, device) {
        var options = {
            json: true,
            resolveWithFullResponse: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0",
                "Accept": "application/vnd.github.cloak-preview"
            }
        }

        var str = JSON.stringify(device).replace("vendor_", "device_");
        var res = JSON.parse(str);

        var branchesReq = await rp.get("https://api.github.com/repos/AndroidBlobs/" + res.name + "/branches", options)
        var branches = branchesReq.body;
        var message = "*Existing device tree* : \n";
        for (let branche of branches) {
            message += "[" + branche.name + "](https://github.com/AndroidBlobs/" + res.name + "/tree/" + branche.name + ") \n"
        }

        $.sendMessage(message, {
            parse_mode: "markdown",
            disable_web_page_preview: true,
            reply_to_message_id: $.message.messageId
        });
    }

    get routes() {
        return {
            'dtHandler': 'getDt',
        }
    }
}

module.exports = GetdtController;
