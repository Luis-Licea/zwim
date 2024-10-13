{
  # bash,
  fcitx5,
  lib,
  # stdenv,
  w3m,
  wayland,
  # xdg-user-dirs,
  zim-tools,
  buildNpmPackage,
  ...
}:
buildNpmPackage rec {
  pname = "zwim";
  version = "1.0.0";

  # For local development with `nix profile install`
  src = ../../.;

  # src = builtins.fetchTree {
  #   type = "github";
  #   owner = "luis-licea";
  #   repo = "zict";
  #   # host = "";
  #   ref = "main";
  #   # rev = "de7afb50a20389079f09a5f43091629861279fdf";
  # };

  preConfigure = ''
    substituteInPlace library/dependencies.mjs \
          --replace '"fcitx5-remote"' '"${fcitx5}/bin/fcitx5-remote"' \
          --replace '"w3m"' '"${w3m}/bin/w3m"' \
          --replace '"zimdump"' '"${zim-tools}/bin/zimdump"' \
          --replace '"zimsearch"' '"${zim-tools}/bin/zimsearch"'
  '';

  npmDepsHash = "sha256-uLx1Ft38RZbSPUNCUPBbuNHCdxeIeMQjr47cTjlMcqw=";
  dontNpmBuild = true;

  meta = {
    homepage = "https://github.com/luis-licea/zwim/";
    description = "A command-line dictionary based on zim and w3m.";
    longDescription = ''
      Zwim is a flexible, terminal-based dictionary that provides commands for
      downloading, searching, and accessing Zim-format files.
    '';
    license = lib.licenses.gpl3Only;
    inherit (wayland.meta) platforms;
  };
}
