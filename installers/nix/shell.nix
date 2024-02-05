# vim: tabstop=2 softtabstop=2 shiftwidth=2 expandtab filetype=nix
# Run nix-shell to activate this environment in NixOS.
{pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  name = "Zwim Development Shell";
  buildInputs = with pkgs; [
    xdg-user-dirs
    bash
    zim-tools
    nodejs_21
    w3m
  ];
}
