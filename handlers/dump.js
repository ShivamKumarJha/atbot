const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const config = require("../config.js")
var spawn = require('child_process').spawn;
var Queue = require('better-queue');

var q = new Queue(function (input, cb) {
    var $ = input.scope;
    var urlarg = input.url;
    var initialMessage = "Starting dump...";
    $.sendMessage(initialMessage, {
        parse_mode: "markdown",
        reply_to_message_id: $.message.messageId
    }).then(function (msg) {
        var dump = spawn(__dirname + "/../helpers/dump.sh", [urlarg]);
        dump.stdout.on('data', function (data) {
            var message = data.toString();
            initialMessage = initialMessage + "\n" + message.trim()
            tg.api.editMessageText("`" + initialMessage + "`", {
                parse_mode: "markdown",
                chat_id: msg._chat._id,
                disable_web_page_preview: true,
                message_id: msg._messageId
            });
        });
        dump.stderr.on('data', function (data) {
            //console.log('stderr: ' + data.toString());
        });
        dump.on('exit', function (code) {
            $.sendMessage("Job done for [URL](" + urlarg + ")", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            })
            cb()
        });
    });
}, {
    concurrent: 2,
    batchSize: 1
})

class DumpController extends TelegramBaseController {
    dump($) {
        if (!config.sudoers.includes($.message.from.id)) {
            $.sendMessage("Not authorised!", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            });
            return;
        }
        if (!$.command.success || $.command.arguments.length === 0) {
            $.sendMessage("Usage: /dump url", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            });
            return;
        }
        for (var i = 0; i < $.command.arguments.length; i++) {
            q.push({
                scope: $,
                url: $.command.arguments[i]
            })
        }
        $.sendMessage("Job added to queue", {
            parse_mode: "markdown",
            reply_to_message_id: $.message.messageId
        })
    }
    get routes() {
        return {
            'dumpHandler': 'dump',
        }
    }
}
module.exports = DumpController;
