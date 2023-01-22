# Zict

A command-line dictionary based on `zim` and `w3m`.

## How to install

Go to the directory where PKGBUILD is located, and run the command.

```sh
makepkg --install --clean
```

## Tab auto-completion

You can test if tab auto completion works by typing:

```sh
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

```sh
zict --copy-config
```
