import * as common from './common-scripts.js';

/*
This is a script file for your page.
You can call functions from the common-scripts.js, such as setBackground(), playSound(), playMusic(), etc.
You can also call any JS function from here.
Below are some examples:
*/


function load() {
    //This will trigger once as soon as the page is loaded.
    const startButton = common.getElement("startbutton");
    const exitButton = common.getElement("exitbutton");
    startButton.onclick = function () {
        common.goToScreen("board.html")
    }
    exitButton.onclick = function() {
        common.exit();
    }
}

load();
