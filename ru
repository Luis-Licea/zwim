#!/usr/bin/bash
wiktionary="$(dirname "$0")/data/wiktionary_ru_all_maxi_2022-08.zim"

ru() {
    # Replace all spaces with underscores.
    local -r word="${1// /_}"
    # Store current keyboard layout.
    local -r layout="$(setxkbmap -query | awk '/layout:/ { print $2 }')"
    # Set keyboard to English so that keybindings work in w3m.
    setxkbmap -layout us
    # Display definition.
    zimdump show --url="$word" "$wiktionary" | w3m -T text/html
    # Restore previous keyboard layout.
    setxkbmap -layout "$layout"
}

ru "$@"
