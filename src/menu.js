import Engine from "../engine.js";

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
      if (
        !Array.from(selectpackage.options).some(
          (option) => option.value === pack,
        )
      )
        createPackageItem(pack, json);
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
  for (var i = selectmode.children.length; i--; ) {
    selectmode.children[i].remove();
  }
}

function load() {
  Engine.Functions.unloadAllStyleSheets();
  Engine.Functions.loadStyleSheet(
    Engine.Variables.RootFolder + Engine.Variables.UtilsFolder + "engine.css"
  );
  Engine.Functions.loadStyleSheet(
    `../assets/${selectpackage.value}/${settings.styles.menustyle}`,
  );
  fetchSettings(selectpackage.value);
  selectpackage.onchange = async function () {
    Engine.Functions.unloadAllStyleSheets();
    Engine.Functions.loadStyleSheet(
      Engine.Variables.RootFolder + Engine.Variables.UtilsFolder + "engine.css"
    );
    Engine.Functions.loadStyleSheet(
      `../assets/${selectpackage.value}/${settings.styles.menustyle}`,
    );
    await fetchSettings(selectpackage.value);
  };
  const startButton = document.getElementById("startbutton");
  const exitButton = document.getElementById("exitbutton");
  startButton.onclick = function () {
    localStorage.clear();
    localStorage.setItem("package", selectpackage.value);
    localStorage.setItem("volume", 0.7);
    localStorage.setItem("mode", selectmode.value);
    Engine.Functions.goToScreen(`board.html`);
  };
  exitButton.onclick = function () {
    Engine.Functions.exit();
  };
}

fetchFiles();
