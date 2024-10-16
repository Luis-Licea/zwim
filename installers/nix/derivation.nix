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
buildNpmPackage {
  pname = "zwim";
  version = "1.0.0";

  # For local development with `nix profile install`
  # src = ../../.;

  src = builtins.fetchGit {
    ref = "main";
    rev = "e8005e69a48154f16bd53f04e8d03865cd525999";
    url = "https://github.com/Luis-Licea/zwim.git";
  };

  preConfigure = ''
    substituteInPlace library/dependencies.mjs \
          --replace "'fcitx5-remote'" "'${fcitx5}/bin/fcitx5-remote'" \
          --replace "'w3m'" "'${w3m}/bin/w3m'" \
          --replace "'zimdump'" "'${zim-tools}/bin/zimdump'" \
          --replace "'zimsearch'" "'${zim-tools}/bin/zimsearch'"
  '';

  npmDepsHash = "sha256-+QSE5Juu+0fniBfxtkwK6Pjx2QEYPN289yN/zdOJw9o=";
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
