#compdef zict
# shellcheck disable=2148

_zict() {
    local current wiktionary
    wiktionary="$HOME/Documents/Zict/wiktionary_ru_all_maxi_2022-08.zim"
    current="${COMP_WORDS[COMP_CWORD]}"

    COMPREPLY=$(
        zimsearch "$wiktionary" "$current" |
            awk '/^score/ { for (i=4; i < NF; ++i) printf $i FS; printf $NF"\n" }'
    )

    return 0
}
