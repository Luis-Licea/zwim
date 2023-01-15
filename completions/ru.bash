#!/usr/bin/env bash

search() {
    local -r wiktionary="$HOME/Documents/Zict/wiktionary_ru_all_maxi_2022-08.zim"
    zimsearch "$wiktionary" "$*" |
        awk '/^score/ { for (i=4; i < NF; ++i) printf $i FS; printf $NF"\n" }'
}

_ru() {
    local current words
    current=${COMP_WORDS[COMP_CWORD]}
    mapfile -t words < <(search "${COMP_WORDS[*]:1}")
    mapfile -t COMPREPLY < <(compgen -W "${words[*]// /\\ }" -- "$current")
    return 0
}

complete -o nospace -F _ru ru

# vim: tabstop=4 shiftwidth=4 expandtab filetype=sh
