# zwim - a command-line dictionary based on zim-tools and w3m

## SYNOPSIS

`zwim` [options] [command]

## DESCRIPTION

Zwim is a flexible, terminal-based dictionary that provides commands for downloading, searching, and accessing
Zim-format files.

## COMMANDS

`alter|a` _language words..._

> Remove unwanted language sections and translations from the dictionary entry before viewing it.

`alter-all|aa` _words..._

> Similar to the `alter` command, but one tab is opened for every dictionary result.

`copy-config|c`

> Copy the default configuration file to your [Custom Configuration] file. If the `XDG_CONFIG_HOME` environment variable
> is set, then the configuration file will be copied to the [XDG Configuration] file.

`dictionary-download|dd` _urls..._

> Download dictionaries from the given URLs. If a download is interrupted with `ctrl+c` or otherwise, the
> partially-downloaded file will resume to download by executing the command again.

`dictionary-search|ds` [_languages..._]

> Show dictionary download URLs associated to the given languages. The dictionaries can be downloaded by passing their
> URLs to the `dictionary-download` command. If no languages are given, all the available languages are shown.

`find-config|f`

> Return the path to the configuration file being currently used.

`output|o` _path language words..._

> Output the search results into the given path.

`output-alter|oa` _path language words..._

> Output the pre-processed search results into the given path.

`search|s` _language words..._

> Search the dictionary associated to the given language and show dictionary entries based on similarity.

`view|v` _language words..._

> View the dictionary entry for the given language and phrase.

`view-all|va` _words.._

> Similar to the `view` command, but one tab is opened for every dictionary result.

`help` [_command_]

> View the help message for the given command.

## OPTIONS

`--version|-V`

> Show the program version.

`--help|-h`

> Show a help message.

## NOTES

`Adding Custom Dictionaries and Files`

> To add support for your own Zim-format dictionaries, go to the configuration file specified by `zwim find-config` and
> add the paths to your files.

## EXAMPLES

`zwim` view en a lot

> View English entry for _a lot_.

`zwim` view en dog and `<tab>`

> Show suggestions for _dog and ..._ by pressing `<tab>`.

`zwim` view ru quick brown fox jumps over the lazy dog

> View Russian entry for _quick brown fox jumps over the lazy dog_.

`zwim` dictionary-search english

> Search for URLs from which to download English dictionaries.

`zwim` dictionary-download
https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_en_simple_all_maxi_2024-05.zim

> Download or resume the download of an English dictionary.

`zwim` output /tmp/hello.html en hello

> Save the English search result of "hello" as an HTML file in the _/tmp_ folder.

## FILES

[Custom Configuration]

> The location of the user's configuration file if the `XDG_CONFIG_HOME` environment variable is not set.

[XDG Configuration]

> The location of the user's configuration file if the `XDG_CONFIG_HOME` environment variable is set.

[Default Configuration]

> The default configuration file. Instead of modifying this file you should create your custom configuration file by
> running `zwim copy-config`.

## SEE ALSO

`w3m`(1), `zim`(1), `zimdump`(1), `zimsearch`(1)

[Custom Configuration]: ~/.config/zwim/zwim.mjs
[Default Configuration]: /usr/share/zwim/zwim.mjs
[XDG Configuration]: $XDG_CONFIG_HOME/zwim/zwim.mjs
