# Zict

A command-line dictionary based on `zim` and `w3m`.

[![Zict](https://img.youtube.com/vi/RH8cHOqvA6o/hqdefault.jpg)](https://www.youtube.com/watch?v=RH8cHOqvA6o "Zict")

## How to install

Go to the directory where PKGBUILD is located, and run the command.

```bash
makepkg --install --clean
```

## Tab auto-completion

You can test if tab auto completion works by typing:

```bash
zict <tab><tab>
```

If tab-autocompletion does not work, try the solutions below.

### zsh

Add this line to your `.zshrc`.

```zsh
autoload -U +X compinit && compinit
```

Oh-my-zsh should support tab-completion out-of-the-box. If not, reinstall
Oh-my-zsh. This worked for me probably because I was missing the `~/.oh-my-zsh`
directory.

### bash

Install `bash-completion` using your package manager.

## Customization

You can add your own Zim-format dictionaries by modifying the provided
configuration file.

To copy the default configuration file:

```bash
zict --copy-config
```

## Pre-processor

You can modify Wiktionary entries before displaying them in w3m by using a
pre-processor.

For example, I prefer removing all the language sections that I find irrelevant
before viewing the dictionary entry. I only want to see sections for English,
Spanish, and a few others.

I created a pre-processor that removes those unwanted language sections:
[zict-preprocessor](https://github.com/luis-licea/zict-preprocessor)
