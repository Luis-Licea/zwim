#!/usr/bin/bash
# Do source <scriptname>
wiktionary="$HOME/Code/ruzim/wiktionary_ru_all_maxi_2022-08.zim"
_ru()
{
    local current="${COMP_WORDS[COMP_CWORD]}"
    COMPREPLY=("$(zimsearch "$wiktionary" "$current" | grep : | cut -d: -f2 | sed 's/\t//')")
}


ru() {
    # Replace all spaces with underscores.
    local word="${1// /_}"

    local layout="$(setxkbmap -query | awk '/layout:/ { print $2 }')"
    setxkbmap -layout us
    zimdump show --url="$word" "$wiktionary" | w3m -T text/html
    # zimdump show --url="$word" "$wiktionary" | lynx -stdin
    setxkbmap -layout "$layout"
}

complete -o nospace -F _ru ru
alias д=ru
