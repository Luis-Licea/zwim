# vim: tabstop=2 softtabstop=2 shiftwidth=2 expandtab filetype=nix
# Run nix-shell to activate this environment in NixOS.
{pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  name = "Zwim Development Shell";

  # Needed for building the program.
  buildInputs = with pkgs; [
    bash
    nodejs_22
    w3m
    xdg-user-dirs
    zim-tools
  ];

  # Not needed for building the program.
  nativeBuildInputs = with pkgs; [
    marksman
    ronn
  ];

  ZWIM_CONFIGURATION = builtins.toString ../../configuration/zwim.mjs;
}
