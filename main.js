const fs = require("fs");

const writeToFile = content =>
  fs.writeFile("./install.sh", content, err => err && console.error(err));

const config = {
  modules: {
    // apps
    chrome: true,
    firefox: false, // TODO: this
    gitkraken: false,
    vlc: false,
    discord: false,
    arduino: false,
    spotify: false,

    // utils
    fd_find: false,
    loc: false,
    youtube_dl: false,
    ncdu: false,
    fish: false,
    lsd: false,
    bat: true,
    xclip: false,
    xdotool: false,
    wmctrl: false,

    // langauges
    ts: false,
    js: false,
    c: false, //TODO: this
    cpp: false, // TODO: this
    rust: false,
    go: false,
    python2: false,
    python3: false,
    flutter: false, // TODO: this
    dotnet: false, // TODO: this

    // cloud
    gcloud: false,
    azure: false,
    aws: false,

    vscode: false,
    android_studio: false,

    // utils
    curl: false,
    wget: false,
    git: false,

    // package managers / store
    snap: false
  },

  preferences: {
    git: {
      email: "dominik.t.uk@gmail.com",
      name: "Dominik Tarnowski"
    },
    vscode: {
      extensions: [
        "emmanuelbeziat.vscode-great-icons",
        "wayou.vscode-todo-highlight",
        "ms-vsliveshare.vsliveshare",
        "jolaleye.horizon-theme-vscode",
        "thenikso.github-plus-theme",
        "Equinusocio.vsc-material-theme"
      ]
    }
  },

  improvements: {
    battery: false
  }
};

const depends = (...modules) => {
  for (let key of modules) {
    config.modules[key] = true;
  }
};

const addCodeExtensions = (...extensions) =>
  (config.preferences.vscode.extensions = [
    ...config.preferences.vscode.extensions,
    ...extensions
  ]);

class Script {
  constructor() {
    this.lines = [];
  }
  get content() {
    let output = ["#/bin/bash"];
    let i = this.lines.length - 1;
    let section = [];
    while (i >= 0) {
      const l = this.lines[i];
      if (l[0] === "#") {
        output.push(l);
        if (section.length > 0) {
          output = [...output, ...section.reverse()];
          section = [];
        }
      } else {
        section.push(l);
      }
      i--;
    }
    if (section.length > 0) output = [...output, ...section.reverse()];
    return output.join("\n");
  }

  addLine(...lines) {
    this.lines = [...this.lines, ...lines];
  }
  newLine() {
    this.addLine("");
  }
  comment(text) {
    this.addLine(`# ${text}`);
  }
  aptInstall(...apps) {
    this.addLine(`sudo apt install -y ${apps.join(" ")}`);
  }
  snapInstall(snap, classic = false) {
    depends("snap");
    if (!classic) {
      this.addLine(`snap install ${snap}`);
    } else {
      this.addLine(`sudo snap install ${snap} --classic`);
    }
  }
}

const getScript = config => {
  const script = new Script();

  for (let module in config.modules) {
    if (!config.modules[module]) continue;
    script.comment(module);
    switch (module) {
      case "chrome":
        depends("wget");
        script.addLine(
          "wget -O chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb",
          "sudo dpkg -i chrome.deb",
          "sudo rm chrome.deb"
        );
        break;
      case "spotify":
        depends("curl");
        script.addLine(
          "curl -sS https://download.spotify.com/debian/pubkey.gpg | sudo apt-key add -",
          `echo "deb http://repository.spotify.com stable non-free" | sudo tee /etc/apt/sources.list.d/spotify.list`,
          "sudo apt-get update -y"
        );
        script.aptInstall("spotify-client");
        break;
      case "arduino":
        script.aptInstall("arduino");
        break;
      case "gitkraken":
        depends("wget");
        script.addLine(
          "wget -O gitkraken.deb https://release.gitkraken.com/linux/gitkraken-amd64.deb",
          "sudo dpkg -i gitkraken.deb",
          "rm gitkraken.deb"
        );
        break;
      case "vlc":
        script.snapInstall("vlc");
        break;
      case "discord":
        script.snapInstall("discord");
        break;

      case "fd_find":
        depends("rust");
        script.addLine("cargo install fd-find");
        break;
      case "loc":
        depends("rust");
        script.addLine("cargo install loc");
        break;
      case "ncdu":
        script.aptInstall("ncdu");
        break;
      case "youtube_dl":
        script.snapInstall("youtube-dl");
        break;
      case "fish":
        script.aptInstall("fish");
        script.addLine("chsh -s $(which fish)");
        break;
      case "lsd":
        depends("snap");
        script.addLine("sudo snap install lsd --devmode");
        break;
      case "bat":
        depends("wget");
        script.addLine(
          "wget -O bat.deb https://github.com/sharkdp/bat/releases/download/v0.11.0/bat_0.11.0_amd64.deb",
          "sudo dpkg -i bat.deb",
          "rm bat.deb"
        );
        break;
      case "xclip":
        script.aptInstall("xclip");
        break;
      case "xdotool":
        script.aptInstall("xdotool");
        break;
      case "wmctrl":
        script.aptInstall("wmctrl");
        break;

      case "ts":
        depends("js");
        addCodeExtensions("ms-vscode.vscode-typescript-tslint-plugin");
        script.addLine("sudo npm i -g ts-node");
        break;
      case "js":
        addCodeExtensions(
          "esbenp.prettier-vscode",
          "msjsdiag.debugger-for-chrome",
          "jpoissonnier.vscode-styled-components",
          "formulahendry.auto-rename-tag"
        );
        script.aptInstall("nodejs", "npm");
        script.addLine("sudo npm i -g nodemon");
        break;
      case "rust":
        script.addLine(
          `curl https://sh.rustup.rs -sSf | sh`,
          `source $HOME/.cargo/env`,
          `cargo install cargo-watch`,
          `echo "source $HOME/.cargo/env" >> $HOME/.rc`,
          `source $HOME/.rc`
        );
        break;
      case "go":
        addCodeExtensions("ms-vscode.go");
        script.addLine(
          "sudo add-apt-repository ppa:longsleep/golang-backports -y",
          "sudo apt install golang-go -y"
        );
        script.addLine(
          String.raw`echo "export PATH=\"$PATH:$HOME/go/bin\"" >> $HOME/.rc`
        );
        script.addLine(`source $HOME/.rc`);
        break;
      case "python2":
        addCodeExtensions("ms-python.python");
        script.aptInstall("python", "pip");
        break;
      case "python3":
        addCodeExtensions("ms-python.python");
        script.aptInstall("python3", "pip3");
        break;
      case "flutter":
        depends("git", "curl", "android_studio");
        addCodeExtensions(
          "dart-code.dart-code",
          "dart-code.flutter",
          "redhat.vscode-yaml"
        );
        break;
      case "cpp":
        addCodeExtensions("ms-vscode.cpptools");
        break;
      case "dotnet":
        addCodeExtensions("ms-vscode.csharp");
        break;

      case "android_studio":
        script.snapInstall("android-studio", false);
        break;
      case "vscode":
        depends("wget");
        // install.snapInstall("vscode", false);
        script.addLine(
          "wget -O vscode.deb https://go.microsoft.com/fwlink/?LinkID=760868",
          "sudo dpkg -i vscode.deb",
          "rm vscode.deb"
        );
        for (let extension of config.preferences.vscode.extensions) {
          script.addLine(`code --install-extension ${extension}`);
        }
        break;

      case "git":
        addCodeExtensions("eamodio.gitlens");
        script.aptInstall("git");
        script.addLine(
          `git config --global user.email ${config.preferences.git.email}`,
          `git config --global user.name ${config.preferences.git.name}`
        );
        break;
      case "curl":
        script.aptInstall("curl");
        break;
      case "wget":
        script.aptInstall("wget");
        break;
      case "snap":
        script.aptInstall("snapd");
        break;
    }
    script.addLine("");
  }

  script.addLine("# update & upgrade");
  script.addLine("sudo apt update -y");
  script.addLine("sudo apt upgrade -y");
  script.addLine("");
  // todo: add "source $HOME/.rc" to the profile

  return script.content;
};

const script = getScript(config);

writeToFile(script);
