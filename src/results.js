import * as common from "./common-scripts.js";

let current_package = document.cookie.split(";")[0].split("=")[1];

let mode = document.cookie.split(";")[1].split("=")[1];

let team1score = document.cookie.split(";")[2].split("=")[1];
let team2score = document.cookie.split(";")[3].split("=")[1];

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
    document.cookie = `package=${current_package}; path=board.html`;
    document.cookie = `mode=${mode}; path=board.html`;
    common.goToScreen(`board.html`);
  };
  const exitButton = common.getElement("exitbutton");
  exitButton.onclick = function () {
    common.exit();
  };
  common.playSound(`${package_folder}/${settings.sounds.victorysound}`);
}
