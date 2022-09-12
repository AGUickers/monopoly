import * as common from "./common-scripts.js";

function load() {
  //This will trigger once as soon as the page is loaded.
  const startButton = common.getElement("startbutton");
  const exitButton = common.getElement("exitbutton");
  startButton.onclick = function () {
    common.goToScreen("board.html");
  };
  exitButton.onclick = function () {
    common.exit();
  };
}

load();
