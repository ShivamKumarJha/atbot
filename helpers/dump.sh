#!/usr/bin/env bash

[[ -z "$1" ]] && exit 1
android_tools="$(mktemp tgbotXXX -d --tmpdir=/home/$USER)"
git clone -q https://github.com/ShivamKumarJha/android_tools.git "$android_tools" --depth 1
export DUMMYDT=y
export DUMPYARA=y
export VERBOSE=n

for var in "$@"; do
    mkdir -p "$android_tools/input"
    cd "$android_tools/input"
    echo "Downloading ROM"
    if echo ${var} | grep "https://drive.google.com/" && [[ ! -z "$(which gdrive)" ]]; then
        FILE_ID="$(echo "${var:?}" | sed -Er -e 's/https.*id=(.*)/\1/' -e 's/https.*\/d\/(.*)\/(view|edit)/\1/' -e 's/(.*)(&|\?).*/\1/')"
        gdrive download "$FILE_ID" || { echo "Download failed!"; rm -rf "$android_tools/"; exit 1; }
    elif echo ${var} | grep "https://mega.nz/" && [[ -e "/usr/bin/megadl" ]]; then
        megadl "${var}" --no-progress || { echo "Download failed!"; rm -rf "$android_tools/"; exit 1; }
    else
        aria2c -q -s 16 -x 16 "$(echo ${var} | sed "s|bigota.d.miui.com|hugeota.d.miui.com|g" )" -d "$android_tools/input" -o "otafile" || { echo "Download failed!"; rm -rf "$android_tools/"; exit 1; }
    fi
    find -name "* *" -type f | rename 's/ /_/g'
    URL=$( ls "$android_tools/input/" )
    echo "Extracting ROM"
    bash "$android_tools/tools/rom_extract.sh" "$android_tools/input/$URL"
    rm -rf "$android_tools/input/$URL"
done
rm -rf "$android_tools/"
