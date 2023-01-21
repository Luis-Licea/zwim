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

### bash

Install `bash-completion` using your package manager.

## To Do

- Add release tags.
- Sign releases.
