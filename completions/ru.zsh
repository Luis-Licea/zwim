#compdef ru
# shellcheck disable=2148

_ru() {
    local current wiktionary
    wiktionary="$HOME/Documents/Zict/wiktionary_ru_all_maxi_2022-08.zim"
    current="${COMP_WORDS[COMP_CWORD]}"

    COMPREPLY=$(
        zimsearch "$wiktionary" "$current" |
            awk '/^score/ { for (i=4; i < NF; ++i) printf $i FS; printf $NF"\n" }'
    )

    return 0
}

# vim: tabstop=4 shiftwidth=4 expandtab filetype=sh
