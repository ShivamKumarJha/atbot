#!/usr/bin/env bash

[[ -z "$1" ]] && exit 1
android_tools="$(mktemp tgbotXXX -d --tmpdir=/home/$USER)"
git clone -q https://github.com/ShivamKumarJha/android_tools.git "$android_tools" --depth 1
export DUMMYDT=y
export DUMPYARA=y
export VERBOSE=n

for var in "$@"; do
    bash "$android_tools/tools/rom_extract.sh" "${var}"
done
rm -rf "$android_tools/"
