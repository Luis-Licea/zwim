#compdef zict
# shellcheck disable=2034,2296,2148,2154

_zict() {
    if ((CURRENT == 2)); then
        if [[ "${words[CURRENT]}" = -* ]]; then
            _arguments : \
                '(-)'{--help,-h}'[Show help message]' \
                '(--download -d)'{--download,-d}'[Download the given file]' \
                '(--search -s)'{--search,-s}'[Search similar words]' \
                '--alter[Preprocess entry before viewing it]' \
                '--config-file[The path to the config file being used]' \
                '--copy-config[Copy the default configuration file]'
        else
            local -a commands=(
                'alter:Preprocess entry before viewing it'
                'download:Download the given file'
                'help:Show help message'
                'search:Search similar words'
            )
            source "$(zict --config-file)"
            commands+=("${MY_ZIM_HINTS[@]}")

            _describe -t commands 'zict' commands
        fi
    else
        local option="${words[2]}"
        source "$(zict --config-file)"
        local -ra dictionaries=("${MY_ZIM_HINTS[@]}")

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
            local -a results=("${(f)$(zict --search "${option#--}" "${words[@]:2}")}")
            _describe -t commands 'zict <language>' results
            ;;
        esac
    fi
}

# vim: ft=zsh
