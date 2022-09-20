import * as common from "./common-scripts.js";

function load() {
  let score1 = common.getElement("score1");
  let score2 = common.getElement("score2");
  if (window.location.search) {
    score1.innerText = window.location.search
      .substring(1)
      .split("=")[1]
      .split("&")[0];
    score2.innerText = window.location.search.substring(1).split("=")[2];
  }
  let team1score = parseInt(score1.innerText);
  let team2score = parseInt(score2.innerText);
  const PlayAgain = common.getElement("playagain");
  PlayAgain.onclick = function () {
    if (team1score !== 0 && team2score !== 0)
      common.goToScreen("board.html?completed=1");
    else common.goToScreen("board.html");
  };
  const exitButton = common.getElement("exitbutton");
  exitButton.onclick = function () {
    common.exit();
  };
  common.playSound("monopoly_victory.wav");
}

load();
