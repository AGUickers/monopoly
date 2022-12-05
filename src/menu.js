import * as common from "./common-scripts.js";

let packages = undefined;

let settings = undefined;

let selectpackage = document.getElementById("package");
let selectmode = document.getElementById("mode");

function fetchFiles() {
  fetch("../assets/files.json")
    .then((response) => response.json())
    .then(async (json) => {
      console.log(json);
      packages = json;
      for (let i = 0; i < packages.files.length; i++) {
        await fetchSettings(packages.files[i]);
      }
      load();
    });
}

async function fetchSettings(pack) {
  await fetch(`../assets/${pack}/settings.json`)
    .then((response) => response.json())
    .then(async (json) => {
      console.log(json);
      let packageopt = document.createElement("option");
      packageopt.value = pack;
      packageopt.innerHTML = json.general.visiblename;
      selectpackage.appendChild(packageopt);
      json.general.modes.forEach((element) => {
        if (element !== "scripted" && element !== "random") return false;
        let modeopt = document.createElement("option");
        modeopt.value = element;
        switch (element) {
          case "scripted":
            modeopt.innerHTML = "Story Mode";
            break;
          case "random":
            modeopt.innerHTML = "Free Play";
            break;
        }
        selectmode.appendChild(modeopt);
        settings = json;
      });
    });
}

function load() {
  common.loadStyleSheet(
    `../assets/${selectpackage.value}/${
      settings.styles.menustyle
    }`
  );
  selectpackage.onchange = async function () {
    common.loadStyleSheet(
      `../assets/${selectpackage.value}/${
        settings.styles.menustyle
      }`
    );
    await fetchFiles();
  };
  const startButton = common.getElement("startbutton");
  const exitButton = common.getElement("exitbutton");
  startButton.onclick = function () {
    document.cookie = `package=${selectpackage.value}; path=board.html`;
    document.cookie = `mode=${selectmode.value}; path=board.html`;
    common.goToScreen(`board.html`);
  };
  exitButton.onclick = function () {
    common.exit();
  };
}

fetchFiles();
