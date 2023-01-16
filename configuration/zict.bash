#!/usr/bin/env bash

# The directory where dictionaries will be downloaded.
readonly DOWNLOAD_DIR="$HOME/Documents/Zict"

# The URLs from which the dictionaries will be downloaded.
declare -rA WIKTIONARY_DOWNLOAD_URL=(
    # The Russian Wiktionary weighs about 2GB.
    [ru]='https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_ru_all_maxi_2022-08.zim'
    # The English Wiktionary weighs about 7GB.
    [en]='https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_en_all_maxi_2022-09.zim'
)

# The paths to the dictionaries.
declare -rA WIKTIONARY_PATH=(
    [ru]="$DOWNLOAD_DIR/wiktionary_ru_all_maxi_2022-08.zim"
    [en]="$DOWNLOAD_DIR/wiktionary_en_all_maxi_2022-09.zim"
)
