const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const config = require("../config.js")
var spawn = require('child_process').spawn;
var Queue = require('better-queue');

var q = new Queue(function (input, cb) {
    var $ = input.scope;
    var initialMessage = "Starting ddump...";
    $.sendMessage(initialMessage, {
        parse_mode: "markdown",
        reply_to_message_id: $.message.messageId
    }).then(function (msg) {
        var shell = require('shelljs');
        var tfile = shell.exec('mktemp', {silent:true}).stdout;
        console.log('Arg file: ', tfile);
        for (var i = 0; i < $.command.arguments.length; i++) {
            shell.exec('echo ' + $.command.arguments[i] + ' >> ' + tfile);
        }
        var ddump = spawn(__dirname + "/../helpers/ddump.sh", [tfile]);
        ddump.stdout.on('data', function (data) {
            var message = data.toString();
            initialMessage = initialMessage + "\n" + message.trim()
            tg.api.editMessageText("`" + initialMessage + "`", {
                parse_mode: "markdown",
                chat_id: msg._chat._id,
                disable_web_page_preview: true,
                message_id: msg._messageId
            });
        });
        ddump.stderr.on('data', function (data) {
            //console.log('stderr: ' + data.toString());
        });
        ddump.on('exit', function (code) {
            $.sendMessage("Job done", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            })
            cb()
        });
    });
}, {
    concurrent: 1,
    batchSize: 1
})

class DdumpController extends TelegramBaseController {
    ddump($) {
        if (!config.sudoers.includes($.message.from.id)) {
            $.sendMessage("Not authorised!", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            });
            return;
        }
        if (!$.command.success || $.command.arguments.length === 0) {
            $.sendMessage("Usage: /ddump <full OTA URL> <patch OTA URL>", {
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
            'ddumpHandler': 'ddump',
        }
    }
}
module.exports = DdumpController;
