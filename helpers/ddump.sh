#!/usr/bin/env bash

otadownload() {
    echo "Downloading $DFILE"
    aria2c -q -s 16 -x 16 ${DLINK} -d "$android_tools/input" -o ${DFILE} || { echo "Download failed!"; rm -rf "$android_tools/"; exit 1; }
}

[[ -z "$2" ]] && exit 1
android_tools="$(mktemp tgbotXXX -d --tmpdir=/home/$USER)"
git clone -q https://github.com/ShivamKumarJha/android_tools.git "$android_tools" --depth 1
export VERBOSE=n

mkdir -p "$android_tools/input"
cd "$android_tools/input"
DLINK="$1"
DFILE="fullota"
otadownload
DLINK="$2"
DFILE="patchota"
otadownload

bash "$android_tools/tools/deltaota.sh" "$android_tools/input/fullota" "$android_tools/input/patchota"
if [[ -d "$android_tools/dumps/patchota" ]]; then
    bash "$android_tools/helpers/dumpyara_push.sh" "$android_tools/dumps/patchota"
    bash "$android_tools/tools/dummy_dt.sh" "$android_tools/dumps/patchota"
else
    echo "Extraction failed!"
fi
rm -rf "$android_tools/"
