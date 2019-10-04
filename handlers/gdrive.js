const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const request = require('request')
const JSDOM = require('jsdom');

class GDriveController extends TelegramBaseController {

    parseLink($) {

        if (!$.command.success || $.command.arguments.length === 0) {
            $.sendMessage("Usage: /gdrive url", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            });
            return;
        }

        if (!$.message.text.includes("https://drive.google.com/")) {
            $.sendMessage("Invalid URL", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            });
            return;
        }

        var shell = require('shelljs');
        var fileID = shell.exec('echo ' + $.message.text + ' | sed "s|https://drive.google.com/||g" | sed "s|/view.*||g" | sed "s|.*id=||g" | sed "s|.*file/d/||g" | sed "s|&export=.*||g" ');
        console.log('gdrive fileID: ', fileID + "");

        var cookieRequest = request.defaults({
            jar: true
        })

        var exportURL = "https://drive.google.com/uc?export=download&id=" + fileID;
        cookieRequest.get({
                url: exportURL,
                followRedirect: false
            },
            function (error, response, body) {

                if (response.headers.location) {
                    if (response.headers.location.indexOf("accounts.google.com") !== -1) {
                        //Ignore non public links
                        return;
                    }

                    $.sendMessage("[Direct Download Link](" + response.headers.location + ")", {
                        parse_mode: "markdown",
                        reply_to_message_id: $.message.messageId
                    });
                    return;
                }

                var dom = new JSDOM.JSDOM(body);

                var fileName = dom.window.document.querySelector(".uc-name-size a").textContent;

                var dlLink = "https://drive.google.com" + dom.window.document.querySelector("#uc-download-link").href;

                cookieRequest.get({
                        url: dlLink,
                        followRedirect: false
                    },
                    function (error, response, body) {

                        if (response.headers.location && response.headers.location.indexOf("accounts.google.com") !== -1) {
                            // Non public link
                            return;
                        }

                        $.sendMessage("Direct Download : [" + fileName + "](" + response.headers.location + ")", {
                            parse_mode: "markdown",
                            reply_to_message_id: $.message.messageId
                        });
                    });
            });
    }

    get routes() {
        return {
            'gdriveFilterHandler': 'parseLink',
        }
    }
}

module.exports = GDriveController;
