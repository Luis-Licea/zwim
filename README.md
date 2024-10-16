# Zwim

A command-line dictionary based on `zim` and `w3m`.

[![Zwim](https://img.youtube.com/vi/RH8cHOqvA6o/hqdefault.jpg)](https://www.youtube.com/watch?v=RH8cHOqvA6o "Zwim")

## How to install

In Arch Linux, install `PKGBUILD`.

```bash
cd installers/arch
makepkg --install --clean
```

In NixOS, install `flake.nix`.

```bash
cd installers/nix
nix profile install .
```

## Tab auto-completion

You can test if tab auto completion works by typing:

```bash
zwim <tab><tab>
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
zwim copy-config
```

## Pre-processor

You can modify Wiktionary entries before displaying them in w3m by using a
pre-processor.

For example, I prefer removing all the language sections that I find irrelevant
before viewing the dictionary entry. I only want to see sections for English,
Spanish, and a few others.

This setting can be modified in the [configuration
file](./configuration/zwim.mjs).
