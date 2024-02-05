#!/usr/bin/env bash

# For testing, execute `source complete.bash` from bash. Resource after changes.
_zwim() {
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
                output
                output-alter
                search
            )
            source "$(zwim --find-config)"
            options+=("${!MY_ZIM_FILES[@]}")
        fi
        mapfile -t COMPREPLY < <(compgen -W "${options[*]}" -- "$current")
    else
        source "$(zwim --find-config)"
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
            mapfile -t words < <(zwim search "${COMP_WORDS[2]}" "${COMP_WORDS[@]:3}")
            # Replace every space with a backslash and a space.
            # For example: "a short string" becomes "a\ short\ string".
            mapfile -t COMPREPLY < <(compgen -W "${words[*]// /\\ }" -- "$current")
            ;;
        o | output | \
        oa | output-alter | \
        ao | alter-output)
            # Suggest a file path.
            if ((COMP_CWORD <= 2)); then
                mapfile -t COMPREPLY < <(compgen -o filenames -A file -- "$current")
                return
            fi
            # Suggest a dictionary.
            if [[ -z "${COMP_WORDS[3]}" ]]; then
                mapfile -t COMPREPLY < <(compgen -W "${dictionaries[*]}" -- "$current")
                return
            fi
            # Convert result into an array.
            mapfile -t words < <(zwim search "${COMP_WORDS[3]}" "${COMP_WORDS[@]:4}")
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
        *)
            # Convert result into an array.
            mapfile -t words < <(zwim search "$option" "${COMP_WORDS[@]:2}")
            # Replace every space with a backslash and a space.
            # For example: "a short string" becomes "a\ short\ string".
            mapfile -t COMPREPLY < <(compgen -W "${words[*]// /\\ }" -- "$current")
            ;;
        esac
    fi
}

# Options:
# nospace: Do not add spaces after suggestion insertion.
# -F: Use _zwim function to tab-complete zwim program.
complete -o nospace -F _zwim zwim
