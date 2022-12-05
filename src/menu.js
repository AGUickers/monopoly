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
      if (!Array.from(selectpackage.options).some((option) => option.value === pack)) createPackageItem(pack, json);
      resetModeList();
      for (let i = 0; i < json.general.modes.length; i++) {
        await createModeItem(json.general.modes[i]);
      }
      settings = json;
    });
}

function createPackageItem(item, json) {
  let packageopt = document.createElement("option");
  packageopt.value = item;
  packageopt.innerHTML = json.general.visiblename;
  selectpackage.appendChild(packageopt);
}

async function createModeItem(element) {
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
}

async function resetModeList() {
  for (var i=selectmode.children.length; i--;) {
    selectmode.children[i].remove();
  }
}

function load() {
  common.loadStyleSheet(
    `../assets/${selectpackage.value}/${
      settings.styles.menustyle
    }`
  );
  selectpackage.onchange = async function () {
    common.unloadAllStyleSheets();
    common.loadStyleSheet(
      `../assets/${selectpackage.value}/${
        settings.styles.menustyle
      }`
    );
    await fetchSettings(selectpackage.value);
  };
  const startButton = common.getElement("startbutton");
  const exitButton = common.getElement("exitbutton");
  startButton.onclick = function () {
    common.deleteAllCookies();
    document.cookie = `package=${selectpackage.value}; path=board.html`;
    document.cookie = `mode=${selectmode.value}; path=board.html`;
    common.goToScreen(`board.html`);
  };
  exitButton.onclick = function () {
    common.exit();
  };
}

fetchFiles();
