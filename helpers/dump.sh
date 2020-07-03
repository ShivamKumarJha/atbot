#!/usr/bin/env bash

[[ -z "$1" ]] && exit 1
ATDIR="$(mktemp tgbotXXX -d --tmpdir=/home/$USER)"
git clone -q https://github.com/ShivamKumarJha/android_tools.git "$ATDIR" --depth 1
export DUMMYDT=y
export DUMPPUSH=n
export ORGMEMBER=y
export VERBOSE=n

for var in "$@"; do
    if [[ "$var" == *"https://github.com/"* ]]; then
        URL="$var"
        FILE=${URL##*/}
        EXTENSION=${URL##*.}
        UNZIP_DIR=${FILE/.$EXTENSION/}
        echo "Downloading file"
        aria2c -q -s 16 -x 16 ${URL} -d ${ATDIR}/input -o ${FILE}
        7z x -y "$ATDIR/input/$FILE" -o"$ATDIR/dumps/$UNZIP_DIR" > /dev/null 2>&1
        DUMP_DIR="$(dirname "$(find ${ATDIR}/dumps/${UNZIP_DIR} -type f -name "all_files.txt" | head -1)")"
        bash "$ATDIR/tools/dummy_dt.sh" "$DUMP_DIR"
    else
        bash "$ATDIR/tools/rom_extract.sh" "$(echo ${var} | sed "s|bigota.d.miui.com|hugeota.d.miui.com|g" )"
    fi
done
rm -rf "$ATDIR/"
