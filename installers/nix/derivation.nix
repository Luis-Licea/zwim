{
  # bash,
  fcitx5,
  lib,
  stdenv,
  w3m,
  wayland,
  # xdg-user-dirs,
  zim-tools,
  ...
}:
stdenv.mkDerivation rec {
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

  outputs = ["out" "man"];

          # --replace 'bash' '${bash}/bin/bash' \
          # --replace '/usr/bin/env xdg-user-dir' '${xdg-user-dirs}/bin/xdg-user-dir' \
          # --replace 'conf_default_path="/etc/zwim/$conf_name"' 'conf_default_path="${placeholder "out"}/share/${pname}-${version}/$conf_name"'
  preConfigure = ''
    substituteInPlace executable/index.mjs completions/complete.bash \
          --replace 'fcitx5-remote' '${fcitx5}/bin/fcitx5-remote' \
          --replace 'w3m' '${w3m}/bin/w3m' \
          --replace 'zimdump' '${zim-tools}/bin/zimdump' \
          --replace 'zimsearch' '${zim-tools}/bin/zimsearch'

    substituteInPlace manual/zwim.1 \
        --replace "/usr/share/zwim/zwim.yml" "${placeholder "out"}/share/${pname}-${version}/zwim.yml"

  '';
  installPhase = ''
    # Install license.
    find . -name LICENSE-GPL3.txt -type f -exec install -Dm644 {} \
        "$out/share/licenses/$name/LICENSE-GPL3.txt" \;

    # Install shell completion files.
    find . -name complete.zsh -type f -exec install -Dm644 {} \
        "$out/share/zsh/site-functions/_$pname" \;
    find . -name complete.bash -type f -exec install -Dm644 {} \
        "$out/share/bash-completion/completions/$pname" \;

    # Install manual page.
    find . -name zwim.1 -type f -exec install -Dm644 {} \
        "$man/share/man/man1/zwim.1" \;

    # Install configuration file.
    find . -name zwim.yaml -type f -exec install -Dm644 {} \
        "$out/share/$name/zwim.yml" \;

    # Install executable.
    install -Dm 755 "$pname" "$out/bin/$pname"
  '';

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
