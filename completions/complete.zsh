#compdef zict
# shellcheck disable=2034,2296,2148,2154

_zict() {
    if ((CURRENT == 2)); then
        if [[ ${words[CURRENT]} = -* ]]; then
            _arguments : \
                '(-)'{--help,-h}'[Show help message]' \
                '(--download -d)'{--download,-d}'[Download the given dictionary]' \
                '(--search -s)'{--search,-s}'[Search similar words in given dictionary]' \
                '--en[View English prase]' \
                '--ru[View Russian prase]'
        else
            local -a commands=(
                'help:Show help message'
                'download:Download the given dictionary'
                'search:Search similar words in given dictionary'
                'en:View English prase'
                'ru:View Russian prase'
            )
            _describe -t commands 'zict' commands
        fi
    else
        local option="${words[2]}"
        local -a dictionaries=(
            "en:The English Wiktionary"
            "ru:The Russian Wiktionary"
        )
        case "$option" in
        -d | --download | download)
            # Do not make more suggestions: a suggestion has been selected.
            ((CURRENT >= 4)) && return 0
            _describe -t commands 'zict download' dictionaries
            ;;
        -s | --search | search)
            ((CURRENT >= 4)) && return 0
            _describe -t commands 'zict search' dictionaries
            ;;
        --ru | ru | --en | en)
            # Convert result into an array.
            local -a results=("${(f)$(zict --search "${words[2]#--}" "${words[@]:2}")}")
            _describe -t commands 'zict <language>' results
            ;;
        esac
    fi
}

# vim: ft=zsh
