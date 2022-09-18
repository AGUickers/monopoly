import * as common from "./common-scripts.js";

function load() {
    let score1 = common.getElement("score1");
    let score2 = common.getElement("score2");
    score1.innerText = window.location.search
      .substring(1)
      .split("=")[1]
      .split("&")[0];
      score2.innerText = window.location.search
      .substring(1)
      .split("=")[2];
  const exitButton = common.getElement("exitbutton");
  exitButton.onclick = function () {
    common.exit();
  };
}

load();