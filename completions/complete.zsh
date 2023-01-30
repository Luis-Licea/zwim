#compdef zict
# shellcheck disable=2034,2296,2148,2154

_zict() {
    if ((CURRENT == 2)); then
        if [[ "${words[CURRENT]}" = -* ]]; then
            local -a commands=(
                '(-)'{--help,-h}'[Show help message]'
                '(--copy-config -c)'{--copy-config,-c}'[Copy default configuration file]'
                '(--find-config -f)'{--find-config,-f}'[Get path to configuration file]'
                '(--search -s)'{--search,-s}'[Search similar words]'
            )
            _arguments $commands
        else
            local -a commands=(
                'alter:Preprocess before viewing'
                'download:Download the given file'
                'search:Search similar words'
            )
            source "$(zict --find-config)"
            commands+=("${MY_ZIM_HINTS[@]}")

            _describe -t commands 'zict' commands
        fi
    else
        local option="${words[2]}"
        source "$(zict --find-config)"
        local -ra dictionaries=("${MY_ZIM_HINTS[@]}")

        case "$option" in
        a | alter)
            # Suggest a dictionary.
            if [[ -z "${words[3]}" ]]; then
                _describe -t commands 'zict <option>' dictionaries
                return
            fi
            # Convert result into an array.
            local -a results=("${(f)$(zict search "${words[3]}" "${words[@]:3}")}")
            _describe -t commands 'zict alter <lang> <option>' results
        ;;
        d | download | \
        s | search)
            # Do not make more suggestions: a suggestion has been selected.
            ((CURRENT >= 4)) && return
            _describe -t commands 'zict <option>' dictionaries
            ;;
        *)
            # Convert result into an array.
            local -a results=("${(f)$(zict search "$option" "${words[@]:2}")}")
            _describe -t commands 'zict <language>' results
            ;;
        esac
    fi
}

# vim: ft=zsh
