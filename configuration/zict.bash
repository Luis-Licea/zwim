#!/usr/bin/env bash

# The directory where dictionaries will be downloaded.
# This is ~/Documents/Zict by default but you can change it.
declare -r MY_DOWNLOAD_DIR="$(xdg-user-dir DOCUMENTS)/Zict"

# The URLs from which the dictionaries will be downloaded.
declare -rA MY_DOWNLOAD_URLS=(
    # The Russian Wiktionary weighs about 2GB.
    [ru]="https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_ru_all_maxi_2022-08.zim"
    # The English Wiktionary weighs about 7GB.
    [en]="https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_en_all_maxi_2022-09.zim"
    # The Japanese Wiktionary weighs about 400MB.
    [ja]="https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_ja_all_maxi_2022-12.zim"
)

# The paths to the dictionaries.
declare -rA MY_ZIM_FILES=(
    [ru]="$MY_DOWNLOAD_DIR/wiktionary_ru_all_maxi_2022-08.zim"
    [en]="$MY_DOWNLOAD_DIR/wiktionary_en_all_maxi_2022-09.zim"
    [ja]="$MY_DOWNLOAD_DIR/wiktionary_ja_all_maxi_2022-12.zim"
)

# Not necessary, but improves tab-auto completion suggestions.
declare -ra MY_ZIM_HINTS=(
    "ru:Russian Wiktionary"
    "en:English Wiktionary"
    "ja:Japanese Wiktionary"
)
