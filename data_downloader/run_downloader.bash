#!/usr/bin/env bash
# shellcheck disable=1090

URL_DOWNLOAD_LIST='./urls_to_download.bash'
[[ -f "$URL_DOWNLOAD_LIST" ]] && source "$URL_DOWNLOAD_LIST" || exit

for url_to_download in "${URLS[@]}"; do
    wget --directory-prefix ../data/ --no-clobber "$url_to_download"
done

