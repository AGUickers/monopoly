import * as common from "./common-scripts.js";

var currentTeam = 1;

let maxleftvalue = 53;
let maxupvalue = -640;
let minleftvalue = 613;
let minupvalue = -80;

let currentpos = [0, 0];
//Position can only iterate up to 39.

let questions = undefined;

fetch("../assets/items.json")
  .then((response) => response.json())
  .then((json) => {
    console.log(json);
    questions = json;
  });

//Fill this with zeros for now.
let owned = [
  -1, 0, -1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, 0, 0, -1, 0, 0, -1, 0, -1,
  0, 0, 0, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, -1, 0,
];
console.log(owned.length);

const TextBoxButtonType = {
  OK: 1,
  YesNo: 2,
};

function load() {
  //This will trigger once as soon as the page is loaded.
  let roll = Math.floor(Math.random() * 3) + 1;
  common.playMusic(`../assets/monopoly${roll}.mp3`, true);
  const menu = common.getElement("exit");
  menu.onclick = function () {
    common.goToScreen("menu.html");
  };
  const giveup = common.getElement("giveup");
  giveup.onclick = function () {
    common.goToScreen("results.html");
  };
  const dice = common.getElement("dice");
  dice.onclick = function () {
    throwDice();
  };
}

function spawnTextBox(cardasset, scale, text, fontSize, buttontype) {
  common.playSound("monopoly_chance.wav");
  //Let's cover the entire page with a file named "cover.png"
  const cover = common.createElement("img", "cover", "cover", common.page);
  cover.style.zIndex = "1";
  cover.src = "../assets/cover.png";
  cover.style.width = "100%";
  cover.style.height = "100%";
  cover.style.position = "absolute";
  cover.style.top = "0";
  cover.style.left = "0";

  const card = common.createElement("img", "textcard", "textcard", common.page);
  card.src = cardasset;
  card.style.position = "absolute";
  card.style.zIndex = "2";
  card.style.scale = scale;

  const cardtext = common.createElement(
    "div",
    "cardtext",
    "cardtext",
    common.page
  );
  cardtext.innerText = text;
  cardtext.style.position = "absolute";
  cardtext.style.zIndex = "3";
  cardtext.style.fontSize = fontSize;

  switch (buttontype) {
    case TextBoxButtonType.OK:
    case "OK":
      const OKButton = common.createElement("button", "OK", "OK", common.page);
      OKButton.innerText = "OK";
      OKButton.style.zIndex = "3";
      OKButton.onclick = function () {
        common.playSound("monopoly_select.wav");
        closeTextBox();
        switchTeam();
      };
      break;
    case TextBoxButtonType.YesNo:
    case "YesNo":
      const YesButton = common.createElement(
        "button",
        "Yes",
        "Yes",
        common.page
      );
      YesButton.innerText = "Correct";
      YesButton.style.zIndex = "3";
      YesButton.onclick = function () {
        common.playSound("monopoly_select.wav");
        common.playSound("monopoly_win.wav");
        closeTextBox();
        //Let's set the ownership.
        setOwnership(currentpos[currentTeam - 1], currentTeam);
        //Let's also award some points.
        editPoints(currentTeam, 1000)
        switchTeam();
      };
      const NoButton = common.createElement("button", "No", "No", common.page);
      NoButton.innerText = "Wrong";
      NoButton.style.zIndex = "3";
      NoButton.onclick = function () {
        common.playSound("monopoly_select.wav");
        common.playSound("monopoly_lose.wav");
        closeTextBox();
        switchTeam();
      };
      break;
  }
}

function closeTextBox() {
  const cover = common.getElement("cover");
  const card = common.getElement("textcard");
  const cardtext = common.getElement("cardtext");
  const OKButton = common.getElement("OK");
  const YesButton = common.getElement("Yes");
  const NOButton = common.getElement("No");
  if (cover) cover.remove();
  if (card) card.remove();
  if (cardtext) cardtext.remove();
  if (OKButton) OKButton.remove();
  if (YesButton) YesButton.remove();
  if (NOButton) NOButton.remove();
}

function throwDice() {
  //Let's get a number from 1 to 6 first.
  const dice = common.getElement("dice");
  const player = common.getElement("player" + currentTeam);
  const style = getComputedStyle(player);
  //dice.style.display = "none";
  let roll = Math.floor(Math.random() * 6) + 1;
  console.log(roll);
  common.playSound("../assets/monopoly_dice.wav");
  gotoPos(currentTeam, currentpos[currentTeam - 1] + roll);
  //Let's check if someone already owns that cell.
  if (
    checkOwnership(currentpos[currentTeam - 1]) === false ||
    checkOwnership(currentpos[currentTeam - 1]) === null
  ) {
    //Spawn a textbox with the question on that position.
    //Let's read from the JSON file in the questions variable.
    let currentquestion = questions[currentpos[currentTeam - 1]];
    if (currentquestion) {
      spawnTextBox(
        currentquestion.cardAsset,
        currentquestion.scale,
        currentquestion.text,
        currentquestion.fontSize,
        currentquestion.buttonType
      );
    } else switchTeam();
  } else switchTeam();
}

function editPoints(team, value) {
  const score = common.getElement("score" + team);
  score.innerText = parseInt(score.innerText) + value;
}

function setPos(team, x, y) {
  const player = common.getElement("player" + team);
  player.style.top = y + "px";
  player.style.left = x + "px";
  console.log(`New position: ${x}, ${y}`);
}

function gotoPos(team, pos) {
  //Let's iterate over positions starting from 0 and ending in 39.
  //For position 0, set top and left to minimum values.
  //For positions 1 - 10 go 56 px left.
  //For positions 11 - 20 go 56 px up.
  //For positions 21 - 30 go 56 px left.
  //For positions 31 - 39 go 56 px down.
  console.log("Moving team " + team);
  console.log(pos);
  currentpos[team - 1] = pos;
  if (pos == 0) setPos(team, minleftvalue, minupvalue);
  else if (pos > 0 && pos <= 10)
    setPos(team, minleftvalue - 56 * pos, minupvalue);
  else if (pos > 10 && pos <= 20)
    setPos(team, maxleftvalue, minupvalue - 56 * (pos - 10));
  else if (pos > 20 && pos <= 30)
    setPos(team, maxleftvalue + 56 * (pos - 20), maxupvalue);
  else if (pos > 30 && pos <= 39)
    setPos(team, minleftvalue, maxupvalue + 56 * (pos - 30));
  else if (pos > 39) {
    currentpos[team - 1] = 0;
    setPos(team, minleftvalue, minupvalue);
  }
}

function getPos(pos) {
  if (pos == 0) return [minleftvalue, minupvalue];
  else if (pos > 0 && pos <= 10) return [minleftvalue - 56 * pos, minupvalue];
  else if (pos > 10 && pos <= 20)
    return [maxleftvalue, minupvalue - 56 * (pos - 10)];
  else if (pos > 20 && pos <= 30)
    return [maxleftvalue + 56 * (pos - 20), maxupvalue];
  else if (pos > 30 && pos <= 39)
    return [minleftvalue, maxupvalue + 56 * (pos - 30)];
  else if (pos > 39) {
    return [minleftvalue, minupvalue];
  }
}

function setOwnership(pos, team) {
  if (checkOwnership(pos) != null && checkOwnership(pos) != true) {
    const player = common.getElement("player" + team);
    const playerstyle = getComputedStyle(player);
    owned[pos] = team;
    //We need to spawn an ownership mark.
    const field = common.getElement("field");
    let mark = common.createElement("div", `mark${pos}`, `mark${pos}`, field);
    mark.style.position = "relative";
    mark.style.left = getPos(pos)[0] + "px";
    mark.style.top = getPos(pos)[1] + "px";
    mark.style.backgroundColor = playerstyle.backgroundColor;
    mark.style.borderRadius = "15px";
    mark.style.height = "25px";
    mark.style.width = "25px";
    mark.style.zIndex = "3";
    mark.style.padding = "0px";
  }
}

function switchTeam() {
  switch (currentTeam) {
    case 1:
      currentTeam = 2;
      break;
    case 2:
      currentTeam = 1;
      break;
  }
}

function checkOwnership(pos) {
  switch (owned[pos]) {
    case 0:
      return false;
    case 1:
    case 2:
      return true;
    default:
      return null;
  }
}

load();
setTimeout(() => {
  spawnTextBox(
    "../assets/stockcard.png",
    1,
    "Welcome to the Monopoly Dev Test!\nYou can test various features in here.\nThis might be broken.",
    "20px",
    TextBoxButtonType.OK
  );
}, 1000);
