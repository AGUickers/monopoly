import Engine from "../engine.js";

let current_package = localStorage.getItem("package");

let mode = localStorage.getItem("mode");

let team1score = localStorage.getItem("team1");
let team2score = localStorage.getItem("team2");

let package_folder =
  Engine.Variables.RootFolder + Engine.Variables.AssetsFolder + current_package;
console.log(package_folder);

let settings = undefined;

fetch(`${package_folder}/settings.json`)
  .then((response) => response.json())
  .then((json) => {
    console.log(json);
    settings = json;
    load();
  });

function load() {
  Engine.Functions.unloadAllStyleSheets();
  Engine.Functions.loadStyleSheet(
    Engine.Variables.RootFolder + Engine.Variables.UtilsFolder + "engine.css"
  );
  Engine.Functions.loadStyleSheet(
    `${package_folder}/${settings.styles.resultsstyle}`,
  );
  let score1 = document.getElementById("score1");
  let score2 = document.getElementById("score2");
  score1.innerText = team1score;
  score2.innerText = team2score;
  const PlayAgain = document.getElementById("playagain");
  PlayAgain.onclick = function () {
    Engine.Functions.goToScreen(`board.html`);
  };
  const exitButton = document.getElementById("exitbutton");
  exitButton.onclick = function () {
    Engine.Functions.goToScreen(`menu.html`);
  };
  Engine.Functions.playTrack(
    `${package_folder}/${settings.sounds.victorysound}`,
  );
}
