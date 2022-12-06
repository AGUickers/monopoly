import * as common from "./common-scripts.js";

let current_package = localStorage.getItem("package");

let mode = localStorage.getItem("mode");

let team1score = localStorage.getItem("team1");
let team2score = localStorage.getItem("team2");

let package_folder = `../assets/${current_package}`;
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
  common.loadStyleSheet(`${package_folder}/${settings.styles.resultsstyle}`);
  let score1 = common.getElement("score1");
  let score2 = common.getElement("score2");
  score1.innerText = team1score;
  score2.innerText = team2score;
  const PlayAgain = common.getElement("playagain");
  PlayAgain.onclick = function () {
    common.goToScreen(`board.html`);
  };
  const exitButton = common.getElement("exitbutton");
  exitButton.onclick = function () {
    common.goToScreen(`menu.html`);
  };
  common.playSound(`${package_folder}/${settings.sounds.victorysound}`);
}
