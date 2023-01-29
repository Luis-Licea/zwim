#!/usr/bin/env bash

_zict() {
    local -r current="${COMP_WORDS[COMP_CWORD]}"
    local -a options
    if ((COMP_CWORD == 1)); then
        if [[ "$current" = -* ]]; then
            options=(
                -c
                -f
                -h
            )
        elif [[ "$current" = --* ]]; then
            options=(
                --copy-config
                --find-config
                --help
            )
        else
            options=(
                alter
                download
                search
            )
            source "$(zict --find-config)"
            options+=("${!MY_ZIM_FILES[@]}")
        fi
        mapfile -t COMPREPLY < <(compgen -W "${options[*]}" -- "$current")
    else
        source "$(zict --find-config)"
        local -ra dictionaries=("${!MY_ZIM_FILES[@]}")
        local -r option="${COMP_WORDS[1]}"
        case "$option" in
        a | alter)
            # Suggest a dictionary.
            if [[ -z "${COMP_WORDS[2]}" ]]; then
                mapfile -t COMPREPLY < <(compgen -W "${dictionaries[*]}" -- "$current")
                return
            fi
            # Convert result into an array.
            mapfile -t words < <(zict search "${COMP_WORDS[2]}" "${COMP_WORDS[@]:3}")
            # Replace every space with a backslash and a space.
            # For example: "a short string" becomes "a\ short\ string".
            mapfile -t COMPREPLY < <(compgen -W "${words[*]// /\\ }" -- "$current")
            ;;
        d | download | \
        s | search)
            # Do not make more suggestions: a suggestion has been selected.
            ((COMP_CWORD >= 3)) && return
            mapfile -t COMPREPLY < <(compgen -W "${dictionaries[*]}" -- "$current")
            ;;
        ru | en)
            # Convert result into an array.
            mapfile -t words < <(zict search "$option" "${COMP_WORDS[@]:2}")
            # Replace every space with a backslash and a space.
            # For example: "a short string" becomes "a\ short\ string".
            mapfile -t COMPREPLY < <(compgen -W "${words[*]// /\\ }" -- "$current")
            ;;
        esac
    fi
}

complete -o nospace -F _zict zict
