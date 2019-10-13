#!/usr/bin/env bash

[[ -z "$1" ]] && exit 1
echo "Cloning repo"
android_tools="$(mktemp tgbotXXX -d --tmpdir=/home/$USER)"
git clone -q https://github.com/ShivamKumarJha/android_tools.git "$android_tools" --depth 1

for var in "$@"; do
    mkdir -p "$android_tools/input"
    cd "$android_tools/input"
    rm -rf $android_tools/input/*
    echo "Downloading ROM"
    if echo ${var} | grep "https://drive.google.com/" && [[ -e "/usr/local/bin/gdrive" ]]; then
        gdrive download "$(echo ${var} | sed "s|https://drive.google.com/||g" | sed "s|/view.*||g" | sed "s|.*id=||g" | sed "s|.*file/d/||g" | sed "s|&export=.*||g" )" || exit 1
    else
        aria2c -q -s 16 -x 16 ${var} || wget ${var} || exit 1
    fi
    URL=$( ls "$android_tools/input/" )
    FILE=${URL##*/}
    EXTENSION=${URL##*.}
    UNZIP_DIR=${FILE/.$EXTENSION/}
    echo "Extracting ROM"
    bash "$android_tools/tools/rom_extract.sh" "$android_tools/input/$FILE*"
    bash "$android_tools/tools/dummy_dt.sh" "$android_tools/dumps/$UNZIP_DIR"
    echo "Pushing to AndroidBlobs GitHub"
    bash "$android_tools/helpers/androidblobs.sh" "$android_tools/dumps/$UNZIP_DIR" > /dev/null 2>&1
    echo "Pushing to AndroidDumps GitHub"
    bash "$android_tools/helpers/dumpyara_push.sh" "$android_tools/dumps/$UNZIP_DIR" > /dev/null 2>&1
    echo "Done"
done
rm -rf "$android_tools/"
