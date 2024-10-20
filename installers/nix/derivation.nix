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
  version = "0.1.0";

  # For local development with `nix profile install`
  # src = ../../.;

  src = builtins.fetchGit {
    ref = "main";
    rev = "e8b02c1c394d056a4ec10a4de5e8b5adbad41fc1";
    url = "https://github.com/Luis-Licea/zwim.git";
  };

  preConfigure = ''
    substituteInPlace library/dependencies.mjs \
          --replace "'fcitx5-remote'" "'${fcitx5}/bin/fcitx5-remote'" \
          --replace "'w3m'" "'${w3m}/bin/w3m'" \
          --replace "'zimdump'" "'${zim-tools}/bin/zimdump'" \
          --replace "'zimsearch'" "'${zim-tools}/bin/zimsearch'"
  '';

  npmDepsHash = "sha256-UT+y4SN9mpMeYFHTVzvQWT5mgVmKrEjTy9acSj8jT6s=";
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
