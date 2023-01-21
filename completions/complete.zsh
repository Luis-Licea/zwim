#compdef zict
# shellcheck disable=2034,2296,2148,2154

search() {
    local -r wiktionary="$HOME/Documents/Zict/wiktionary_ru_all_maxi_2022-08.zim"
    zimsearch "$wiktionary" "$*" |
        awk '/^score/ { for (i=4; i < NF; ++i) printf $i FS; printf $NF"\n" }'
}

_zict() {
    if ((CURRENT == 2)); then

        _arguments : \
            '(-)'{--help,-h}'[Show help message]' \
            '(--download -d)'{--download,-d}'[Download the given dictionary]' \
            '--en[View English prase]' \
            '--ru[View Russian prase]'

    else
        local option="${words[2]}"
        case "$option" in
        -d | --download)
            local -a commands=(
                "en:The English Wiktionary"
                "ru:The Russian Wiktionary"
            )
            _describe -t commands 'zict download' commands
            ;;
        --ru)
            # Convert result into an array.
            local -a results=("${(f)$(search "${words[@]:2}")}")
            _describe -t commands 'zict --ru' results
            ;;
        esac
    fi
}

# vim: ft=sh
