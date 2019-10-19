const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const config = require("../config.js")
var spawn = require('child_process').spawn;
var Queue = require('better-queue');

var q = new Queue(function (input, cb) {

    var $ = input.scope;
    var urlarg = input.url;
    var initialMessage = "Preparing proprietary-files.txt for [URL](" + urlarg + ")";
    $.sendMessage(initialMessage, {
        parse_mode: "markdown",
        reply_to_message_id: $.message.messageId
    }).then(function (msg) {

        var shell = require('shelljs');
        var tdir = shell.exec('mktemp -d', {silent:true}).stdout;
        console.log('Repo dir: ', tdir);
        shell.exec('git clone -q --depth 1 https://github.com/ShivamKumarJha/android_tools.git ' + tdir);
        shell.cd('' + tdir);
        if ( shell.exec('./tools/proprietary-files.sh ' + urlarg + ' > /dev/null 2>&1 ' ).code == 0) {
            shell.cd('working');
            var tfile = shell.exec('ls -d $PWD/*', {silent:true}).stdout;
            console.log('bloblist file: ', tfile);
            shell.exec('git init', {silent:true}).stdout;
            shell.exec('git add proprietary-files.txt', {silent:true}).stdout;
            shell.exec('git commit -m proprietary-files.txt', {silent:true}).stdout;
            shell.exec('git push https://$GIT_TOKEN@github.com/ShivamKumarJha/bloblists.git master --force', {silent:true}).stdout;
            var commitid = shell.exec('git log --format=format:%H | head -n 1', {silent:true}).stdout;
            var filelink = 'https://raw.githubusercontent.com/ShivamKumarJha/bloblists/' + commitid + '/proprietary-files.txt';
            console.log('bloblist commit: ', commitid);
            console.log('bloblist link: ', filelink);
            $.sendMessage("Link: [HERE](" + filelink + ")\nJob done", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            })
            cb()
        } else {
            $.sendMessage("Job failed for [URL](" + urlarg + ")", {
                parse_mode: "markdown",
                reply_to_message_id: $.message.messageId
            })
            cb()
        }
    });
}, {
    concurrent: 1,
    batchSize: 1
})

class BloblistController extends TelegramBaseController {

    bloblist($) {
        if (!$.command.success || $.command.arguments.length === 0) {
            $.sendMessage("Usage: /bloblist url", {
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
            'bloblistHandler': 'bloblist',
        }
    }
}

module.exports = BloblistController;
