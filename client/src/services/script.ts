import ScriptConfig from "../models/ScriptConfig"

export class Script {
    lines: string[] = [];

  get content(): string {
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

  addLine(...lines: string[]) {
    this.lines = [...this.lines, ...lines];
  }
  newLine() {
    this.addLine("");
  }
  comment(text: string) {
    this.addLine(`# ${text}`);
  }
  aptInstall(...apps: string[]) {
    this.addLine(`sudo apt install -y ${apps.join(" ")}`);
  }
  snapInstall(snap: string, classic: boolean = false) {
    if (!classic) {
      this.addLine(`snap install ${snap}`);
    } else {
      this.addLine(`sudo snap install ${snap} --classic`);
    }
  }
}

export const getScript = (config: ScriptConfig) => {
  const script = new Script();

  const depends = (...modules: string[]) => {
    for (let key of modules) {
      config[key].enabled = true;
    }
  };
  
  const addCodeExtensions = (...extensions: string[]) => console.log("fix this")
    // (config.preferences.vscode.extensions = [
    //   ...config.preferences.vscode.extensions,
    //   ...extensions
    // ]);

  for (let key in config) {
    if (!config[key].enabled) continue;
    script.comment(key);
    switch (key) {
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
          depends("snap");
        script.snapInstall("vlc");
        break;
      case "discord":
            depends("snap");
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
            depends("snap");
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
          "sudo add-apt-repository ppa:longsleep/golang-backports -y"
        );
        script.aptInstall("golang-go");
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
            depends("snap");
        script.snapInstall("android-studio", false);
        break;
      case "vscode":
        depends("wget");
        script.addLine(
          "wget -O vscode.deb https://go.microsoft.com/fwlink/?LinkID=760868",
          "sudo dpkg -i vscode.deb",
          "rm vscode.deb"
        );
        // for (let extension of config.preferences.vscode.extensions) {
        //   script.addLine(`code --install-extension ${extension}`);
        // }
        break;

      case "git":
        addCodeExtensions("eamodio.gitlens");
        script.aptInstall("git");
        // script.addLine(
        //   `git config --global user.email ${config.preferences.git.email}`,
        //   `git config --global user.name ${config.preferences.git.name}`
        // );
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
  script.addLine("sudo apt-get update -y");
  script.addLine("sudo apt-get upgrade -y");
  script.addLine("");
  // todo: add "source $HOME/.rc" to the profile

  return script.content;
};
