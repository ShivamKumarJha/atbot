#!/usr/bin/env bash

# Store project path
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "$PROJECT_DIR"

if [[ -z "$GIT_TOKEN" ]]; then
    echo "export GIT_TOKEN=<your GitHub token>"
    echo "Alternatively you can store it in ~/.bashrc"
elif [[ -z "$TG_API" ]]; then
    echo "export TG_API=<your Telegram bot token>"
    echo "Alternatively you can store it in ~/.bashrc"
elif [[ -z "$user_password" ]]; then
    echo "export user_password=<your user account password>"
    echo "Alternatively you can store it in ~/.bashrc"
elif [[ -z "$(which node)" ]]; then
    echo "Install node!"
    echo "curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -"
    echo "sudo apt-get install nodejs"
elif [[ -z "$(which forever)" ]]; then
    echo "Install npm forever package!"
    echo "sudo npm install forever -g"
elif [[ -z "$(which rename)" ]]; then
    echo "Install rename package!"
    echo "sudo apt install rename"
elif [[ ! -e config.js ]]; then
    cp -a config.ex.js config.js
    echo "Please update $PROJECT_DIR/config.js!"
    echo "Put bot token & user id in sudoers.\n"
else
    git fetch origin master
    git reset --hard origin/master
    forever stopall
    rm -rf node_modules/ ~/tgbot*
    npm cache clean
    npm install
    forever start bot.js
fi
