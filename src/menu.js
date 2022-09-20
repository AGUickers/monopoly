import * as common from "./common-scripts.js";

function loadAllAssets() {
  var preload = new createjs.LoadQueue(true);
  preload.loadFile("../assets/background.avif");
  preload.loadFile("../assets/logo.avif");
  preload.on("complete", load, this);
}

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
loadAllAssets();
