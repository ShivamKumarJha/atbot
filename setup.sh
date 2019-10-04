#!/usr/bin/env bash

npm install
[[ ! -e config.js ]] && cp -a config.ex.js config.js
