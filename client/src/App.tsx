import React, { useState } from "react";
import ScriptConfig from "./models/ScriptConfig";
import { getScript } from "./services/script";

import saveIcon from "./icons/save.svg";
import download from "./utils/download-file";

const initialConfig: ScriptConfig = {
  chrome: { category: "browser", enabled: false },
  firefox: { category: "browser", enabled: false },

  vlc: { category: "media", enabled: false },
  spotify: { category: "media", enabled: false },
  discord: { category: "media", enabled: false },

  gitkraken: { category: "dev", enabled: false },
  arduino: { category: "dev", enabled: false },
  alacritty: { category: "dev", enabled: false },

  fd_find: { category: "utils", enabled: false },
  loc: { category: "utils", enabled: false },
  youtube_dl: { category: "utils", enabled: false },
  ncdu: { category: "utils", enabled: false },
  fish: { category: "utils", enabled: false },
  lsd: { category: "utils", enabled: false },
  bat: { category: "utils", enabled: false },
  xclip: { category: "utils", enabled: false },
  xdotool: { category: "utils", enabled: false },
  wmctrl: { category: "utils", enabled: false },
  openssh: { category: "utils", enabled: false },

  js: { category: "lang", enabled: false },
  ts: { category: "lang", enabled: false },
  // c: { category: "lang", enabled: false },
  // cpp: { category: "lang", enabled: false },
  rust: { category: "lang", enabled: false },
  go: { category: "lang", enabled: false },
  python2: { category: "lang", enabled: false },
  python3: { category: "lang", enabled: false },
  // flutter: { category: "lang", enabled: false },
  // dotnet: { category: "lang", enabled: false },

  gcloud: { category: "cloud", enabled: false },
  azure: { category: "cloud", enabled: false },
  aws: { category: "cloud", enabled: false },

  vscode: { category: "editor", enabled: false },
  android_studio: { category: "editor", enabled: false },

  wget: { category: "utils", enabled: false },
  curl: { category: "utils", enabled: false },
  git: { category: "utils", enabled: false },

  snap: { category: "pm", enabled: false }
};

interface ModuleProps {
  title: string;
  onChange: (value: boolean) => void;
  checked: boolean;
}

const Module: React.FC<ModuleProps> = ({ title, onChange, checked }) => {
  const [showImg, setShowImg] = useState(true);
  const name = getName(title);
  const onImgError = () => setShowImg(false);
  const makeIcon = (src: string) =>
    process.env.PUBLIC_URL + "/icons/" + src + ".png";

  return (
    <div style={{ display: "flex", alignItems: "center", padding: "4px" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <img
        alt=""
        onError={onImgError}
        width={30}
        height={30}
        src={makeIcon(showImg ? title : "_")}
        style={{ margin: "0 10px" }}
      />
      <div style={{ textTransform: name === title ? "capitalize" : "initial" }}>
        {name.replace("_", " ")}
      </div>
    </div>
  );
};

const getName = (key: string) => {
  switch (key) {
    case "js":
      return "JavaScript";
    case "ts":
      return "TypeScript";
    case "cpp":
      return "C++";
    case "python2":
      return "Python 2.x";
    case "python3":
      return "Python 3.x";
    case "dotnet":
      return ".NET Core";
    case "vlc":
      return "VLC";
    case "aws":
      return "AWS";
    case "vscode":
      return "VS Code";
    case "gcloud":
      return "Google Cloud";
    case "openssh":
      return "OpenSSH";
    default:
      return key;
  }
};

const App: React.FC = () => {
  const [modules, setModules] = useState(initialConfig);

  const renderModule = (key: string) => (
    <Module
      key={key}
      onChange={enabled =>
        setModules({ ...modules, [key]: { ...modules[key], enabled } })
      }
      checked={modules[key].enabled}
      title={key}
    />
  );

  const getCategory = (category: string) => {
    const keys = Object.keys(modules).filter(
      k => modules[k].category === category
    );
    return keys;
  };

  return (
    <div>
      <h1>1. Pick your apps</h1>
      <h2>Browsers</h2>
      {getCategory("browser").map(renderModule)}
      <h2>Media</h2>
      {getCategory("media").map(renderModule)}
      <h2>Developer Tools</h2>
      {getCategory("dev").map(renderModule)}
      <h2>Programming Languages</h2>
      {getCategory("lang").map(renderModule)}
      <h2>Code Editors</h2>
      {getCategory("editor").map(renderModule)}
      {/* <h2>Cloud</h2>
      {getCategory("cloud").map(renderModule)} */}
      <h2>Utilities</h2>
      {getCategory("utils").map(renderModule)}
      <h2>Package Managers</h2>
      {getCategory("pm").map(renderModule)}

      {process.env.NODE_ENV === "development" && <pre>
        <code>{getScript(modules)}</code>
      </pre>}

      <div className="download-btn" onClick={() => download("install.sh", getScript(modules))}>
        <img alt="" width={27} src={saveIcon} />
      </div>
    </div>
  );
};

export default App;
