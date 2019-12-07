const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const config = require("../config.js")
var spawn = require('child_process').spawn;
var Queue = require('better-queue');

var q = new Queue(function (input, cb) {
    var $ = input.scope;
    var initialMessage = "Starting kernel rebase script...";
    $.sendMessage(initialMessage, {
        parse_mode: "markdown",
        reply_to_message_id: $.message.messageId
    }).then(function (msg) {
        var kernel = spawn(__dirname + "/../helpers/kernel.sh", [$.command.arguments[0], $.command.arguments[1], $.command.arguments[2]]);
        kernel.stdout.on('data', function (data) {
            var message = data.toString();
            initialMessage = initialMessage + "\n" + message.trim()
            tg.api.editMessageText("`" + initialMessage + "`", {
                parse_mode: "markdown",
                chat_id: msg._chat._id,
                disable_web_page_preview: true,
                message_id: msg._messageId
            });
        });
        kernel.stderr.on('data', function (data) {
            //console.log('stderr: ' + data.toString());
        });
        kernel.on('exit', function (code) {
            $.sendMessage("Job done", {
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

class KernelController extends TelegramBaseController {
    kernel($) {
        if (!config.sudoers.includes($.message.from.id)) {
            $.sendMessage("Not authorised!", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            });
            return;
        }
        if (!$.command.success || $.command.arguments.length === 0) {
            $.sendMessage("Usage: /kernel <kernel zip link> <repo name> <tag suffix>", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            });
            return;
        }
        q.push({
            scope: $,
            url: $.command.arguments[0]
        })
        $.sendMessage("Job added to queue", {
            parse_mode: "markdown",
            reply_to_message_id: $.message.messageId
        })
    }
    get routes() {
        return {
            'kernelHandler': 'kernel',
        }
    }
}
module.exports = KernelController;
