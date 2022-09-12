import * as common from "./common-scripts.js";

function load() {
  //This will trigger once as soon as the page is loaded.
  common.displayMessageBox("Hello World!", common.messageBoxType.OK);
}

function update() {
  //In combination with the setInterval or setTimeout functions, this will trigger on a timer.
  console.log("Hello World!");
}

load();

setInterval(update, 1000 / 60);
