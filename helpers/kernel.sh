#!/usr/bin/env bash

[[ -z "$3" ]] && exit 1
android_tools="$(mktemp tgbotXXX -d --tmpdir=/home/$USER)"
git clone -q https://github.com/ShivamKumarJha/android_tools.git "$android_tools" --depth 1
bash "$android_tools/tools/rebase_kernel.sh" "${1}" "${2}" "${3}"
rm -rf "$android_tools/"
