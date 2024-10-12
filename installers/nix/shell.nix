# vim: tabstop=2 softtabstop=2 shiftwidth=2 expandtab filetype=nix
# Run nix-shell to activate this environment in NixOS.
{pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  name = "Zwim Development Shell";
  buildInputs = with pkgs; [
    bash
    nodejs_22
    w3m
    xdg-user-dirs
    zim-tools
  ];

  ZWIM_CONFIGURATION = builtins.toString ../../configuration/zwim.mjs;
}
