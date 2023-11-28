{
  bash,
  curl,
  fcitx5,
  gawk,
  lib,
  stdenv,
  w3m,
  wayland,
  xdg-user-dirs,
  zim-tools,
  ...
}:
stdenv.mkDerivation rec {
  pname = "zict";
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

  preConfigure = ''
    substituteInPlace zict configuration/zict.bash completions/complete.bash \
          --replace '/usr/bin/env awk' '${gawk}/bin/awk' \
          --replace '/usr/bin/env bash' '${bash}/bin/bash' \
          --replace '/usr/bin/env curl' '${curl}/bin/curl' \
          --replace '/usr/bin/env fcitx5-remote' '${fcitx5}/bin/fcitx5-remote' \
          --replace '/usr/bin/env w3m' '${w3m}/bin/w3m' \
          --replace '/usr/bin/env xdg-user-dir' '${xdg-user-dirs}/bin/xdg-user-dir' \
          --replace '/usr/bin/env zimdump' '${zim-tools}/bin/zimdump' \
          --replace '/usr/bin/env zimsearch' '${zim-tools}/bin/zimsearch' \
          --replace 'conf_default_path="/etc/zict/$conf_name"' 'conf_default_path="${placeholder "out"}/share/${pname}-${version}/$conf_name"'

    substituteInPlace manual/zict.1 \
        --replace "/usr/share/zict/zict.bash" "${placeholder "out"}/share/${pname}-${version}/zict.bash"

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
    find . -name zict.1 -type f -exec install -Dm644 {} \
        "$man/share/man/man1/zict.1" \;

    # Install configuration file.
    find . -name zict.bash -type f -exec install -Dm644 {} \
        "$out/share/$name/zict.bash" \;

    # Install executable.
    install -Dm 755 "$pname" "$out/bin/$pname"
  '';

  meta = {
    homepage = "https://github.com/luis-licea/zict/";
    description = "A command-line dictionary based on zim and w3m.";
    longDescription = ''
      Zict is a flexible, terminal-based dictionary that provides commands for
      downloading, searching, and accessing Zim-format files.
    '';
    license = lib.licenses.gpl3Only;
    inherit (wayland.meta) platforms;
  };
}
