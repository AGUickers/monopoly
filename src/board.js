import * as common from "./common-scripts.js";

let current_package = document.cookie.split(";")[0].split("=")[1];

let package_folder = `../assets/${current_package}`;
let package_content = undefined;
let filemanifest = [];

console.log(document.cookie);

async function loadPackage() {
fetch(`${package_folder}/files.json`)
  .then((response) => response.json())
  .then((json) => {
    console.log(json);
    package_content = json;
    package_content.files.forEach((file) => {
      console.log(`${package_folder}/${file}`);
      filemanifest.push(`${package_folder}/${file}`);
    });
    fetch(`${package_folder}/settings.json`)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      settings = json;
      if (settings.general.ownedstart) {
        owned = settings.general.ownedstart;
      } else
        owned = [
          -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ];
      if (settings.scripted_settings) {
        movesTeam1 = settings.scripted_settings.team1moves;
        movesTeam2 = settings.scripted_settings.team2moves;
      } else mode = "random";
    });
    console.log("Done loading!");
    loadMandatoryAssets();
  });
}

let currentTeam = 1;

let currentpos = [0, 0];
//Position can only iterate up to 39.

let questions = undefined;
let coords = undefined;

let settings = undefined;

let owned = undefined;

const TextBoxButtonType = {
  OK: 1,
  YesNo: 2,
};

let bgm = undefined;
let defaultbgm = undefined;

let currentquestion = undefined;
let currentmove = 0;

let mode = document.cookie.split(";")[1].split("=")[1];

let movesTeam1 = undefined;

let movesTeam2 = undefined;

async function loadMandatoryAssets() {
  var preload = new createjs.LoadQueue(true);
  //This will trigger once as soon as the page is loaded.
  let count = 0;
  preload.loadManifest(filemanifest);
  preload.setMaxConnections(60);
  preload.on(
    "fileload",
    function () {
      count++;
      console.log("Files loaded: " + count);
    },
    this
  );
  preload.on("complete", load, this);
}

async function load() {
  fetch(`${package_folder}/${settings.general.coordsfile}`)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      coords = json;
    });
  fetch(`${package_folder}/${settings.general.questionsfile}`)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      questions = json;
    });
  screen.orientation.onchange = function () {
    let elem = document.documentElement;
    elem.requestFullscreen("hide");
  };
  console.log("All assets loaded!");
  common.unloadAllStyleSheets();
  common.loadStyleSheet(`${package_folder}/${settings.styles.boardstyle}`);
  document.getElementById("loading").style.display = "none";
  document.getElementById("field").style.display = "block";
  document.getElementById("dice").style.display = "block";
  document.getElementsByClassName("exit")[0].style.display = "inline-block";
  document.getElementsByClassName("exit")[1].style.display = "inline-block";
  document.getElementById("score").style.display = "block";
  switch (Array.isArray(settings.sounds.defaultbgm)) {
    case true:
      let roll = Math.floor(Math.random() * settings.sounds.defaultbgm.length);
      defaultbgm = new Audio(
        `${package_folder}/${settings.sounds.defaultbgm[roll]}`
      );
      break;
    case false:
      defaultbgm = new Audio(`${package_folder}/${settings.sounds.defaultbgm}`);
      break;
    default:
      break;
  }
  bgm = defaultbgm;
  bgm.loop = true;
  bgm.play();
  currentmove = 1;
  const menu = common.getElement("exit");
  menu.onclick = function () {
    common.goToScreen("menu.html");
  };
  const giveup = common.getElement("giveup");
  giveup.onclick = function () {
    endGame();
  };
  const dice = common.getElement("dice");
  dice.onclick = function () {
    throwDice();
  };
}

function spawnTextBox(cardasset, scale, text, fontSize, buttontype) {
  common.playSound(`${package_folder}/${settings.sounds.cardsound}`);
  //Let's cover the entire page with a file named "cover.avif"
  const cover = common.createElement("img", "cover", "cover", common.page);
  cover.style.zIndex = "1";
  cover.src = `${package_folder}/cover.avif`;
  cover.style.width = "100%";
  cover.style.height = "100%";
  cover.style.position = "fixed";
  cover.style.top = "0";
  cover.style.left = "0";

  const card = common.createElement("img", "textcard", "textcard", common.page);
  card.src = `${package_folder}/${cardasset}`;
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
  cardtext.style.fontSize = fontSize + "vmax";

  if (currentquestion) {
    cardtext.style.color = currentquestion.textColor;
    if (currentquestion.image) {
      const cardimage = common.createElement(
        "img",
        "cardimage",
        "cardimage",
        common.page
      );
      cardimage.src = `${package_folder}/${currentquestion.image}`;
      cardimage.style.zIndex = "3";
      cardimage.style.position = "absolute";
      if (currentquestion.imageScale)
        cardimage.style.scale = currentquestion.imageScale;
    }

    if (currentquestion.video) {
      bgm.pause();
      common.playCutScene(
        "cutscene",
        `${package_folder}/${currentquestion.video}`
      );
      const PlayAgain = common.createElement(
        "button",
        "PlayAgain",
        "PlayAgain",
        common.page
      );
      PlayAgain.innerText = "Play Again";
      PlayAgain.style.zIndex = "3";
      PlayAgain.onclick = function () {
        common.playSound(`${package_folder}/${settings.sounds.selectsound}`);
        common.playCutScene(
          "cutscene",
          `${package_folder}/${currentquestion.video}`
        );
      };
      document.onkeydown = (ev) => {
        if (ev.key === "Enter") {
          common.skipCutScene("cutscene");
        }
      };
    }
  }

  switch (buttontype) {
    case TextBoxButtonType.OK:
    case "OK":
      const OKButton = common.createElement("button", "OK", "OK", common.page);
      OKButton.innerText = "OK";
      OKButton.style.zIndex = "3";
      OKButton.onclick = function () {
        common.playSound(`${package_folder}/${settings.sounds.selectsound}`);
        closeTextBox();
        switchTeam();
        if (currentquestion.successvideo) {
          bgm.pause();
          common.playCutScene(
            "cutscene",
            `${package_folder}/${currentquestion.successvideo}`
          );
          document.onkeydown = (ev) => {
            if (ev.key === "Enter") {
              common.skipCutScene("cutscene");
            }
          };
        }
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
        common.playSound(`${package_folder}/${settings.sounds.selectsound}`);
        common.playSound(`${package_folder}/${settings.sounds.winsound}`);
        closeTextBox();
        //Let's set the ownership.
        setOwnership(currentpos[currentTeam - 1], currentTeam);
        //Let's also award some points.
        editPoints(currentTeam, currentquestion.score);
        switchTeam();
        if (currentquestion.successvideo) {
          bgm.pause();
          common.playCutScene(
            "cutscene",
            `${package_folder}/${currentquestion.successvideo}`
          );
          document.onkeydown = (ev) => {
            if (ev.key === "Enter") {
              common.skipCutScene("cutscene");
            }
          };
        }
      };
      const NoButton = common.createElement("button", "No", "No", common.page);
      NoButton.innerText = "Wrong";
      NoButton.style.zIndex = "3";
      NoButton.onclick = function () {
        common.playSound(`${package_folder}/${settings.sounds.selectsound}`);
        common.playSound(`${package_folder}/${settings.sounds.failsound}`);
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
  const imagetext = common.getElement("imagetext");
  const OKButton = common.getElement("OK");
  const YesButton = common.getElement("Yes");
  const NOButton = common.getElement("No");
  const PlayAgain = common.getElement("PlayAgain");
  const cardimage = common.getElement("cardimage");
  if (cover) cover.remove();
  if (card) card.remove();
  if (cardtext) cardtext.remove();
  if (imagetext) imagetext.remove();
  if (OKButton) OKButton.remove();
  if (YesButton) YesButton.remove();
  if (NOButton) NOButton.remove();
  if (PlayAgain) PlayAgain.remove();
  if (cardimage) cardimage.remove();
  if (bgm.paused === true || bgm !== defaultbgm) setDefaultMusic();
}

function throwDice() {
  if (bgm.paused === true || bgm !== defaultbgm) setDefaultMusic();
  //Let's get a number from 1 to 6 first.
  const dice = common.getElement("dice");
  dice.style.display = "none";
  let roll = undefined;
  switch (mode) {
    case "scripted":
      switch (currentTeam) {
        case 1:
          roll = movesTeam1[currentmove];
          console.log(roll);
          break;
        case 2:
          roll = movesTeam2[currentmove];
          console.log(roll);
          break;
      }
      break;
    case "random":
      roll = Math.floor(Math.random() * 6) + 1;
      break;
    default:
      break;
  }
  console.log(roll);
  common.playSound(`${package_folder}/${settings.sounds.dicesound}`);
  gotoPos(currentTeam, currentpos[currentTeam - 1] + roll);
  //Let's check if someone already owns that cell.
  if (
    checkOwnership(currentpos[currentTeam - 1]) === false ||
    checkOwnership(currentpos[currentTeam - 1]) === null
  ) {
    //Spawn a textbox with the question on that position.
    //Let's read from the JSON file in the questions variable.
    currentquestion = questions[currentpos[currentTeam - 1]];
    if (currentquestion) {
      spawnTextBox(
        currentquestion.cardAsset,
        currentquestion.scale,
        currentquestion.text,
        currentquestion.fontSize,
        currentquestion.buttonType
      );
      if (currentquestion.musicOverride)
        setMusic(`${package_folder}/${currentquestion.musicOverride}`);
    } else switchTeam();
  } else switchTeam();
  dice.style.display = "unset";
}

function editPoints(team, value) {
  const score = common.getElement("score" + team);
  score.innerText = parseInt(score.innerText, 10) + value;
}

function getPoints(team) {
  const score = common.getElement("score" + team);
  return parseInt(score.innerText, 10);
}

function setPos(team, x, y) {
  const player = common.getElement("player" + team);
  switch (team) {
    case 1:
      player.style.bottom = y + "%";
      player.style.left = x + "%";
      break;
    case 2:
      player.style.bottom = y + "%";
      player.style.left = x - 7 + "%";
      break;
  }
  console.log(`New position: ${x}, ${y}`);
}

function gotoPos(team, pos) {
  //Let's iterate over positions starting from 0 and ending in 39.
  console.log("Moving team " + team);
  console.log(pos);
  currentpos[team - 1] = pos;
  if (pos > 39) {
    currentpos[team - 1] = 0;
    setPos(team, coords[0].X, coords[0].Y);
    allClear();
  } else setPos(team, coords[pos].X, coords[pos].Y);
}

function getPos(pos) {
  return coords[pos];
}

function setOwnership(pos, team) {
  console.log(checkOwnership(pos));
  if (checkOwnership(pos) !== null && checkOwnership(pos) !== true) {
    const player = common.getElement("player" + team);
    const playerstyle = getComputedStyle(player);
    owned[pos] = team;
    //We need to spawn an ownership mark.
    const field = common.getElement("field");
    let mark = common.createElement("div", `mark${pos}`, `mark${pos}`, field);
    mark.style.position = "absolute";
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
      currentmove++;
      if (currentmove > 9 && mode === "scripted") endGame();
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

function setDefaultMusic() {
  bgm.pause();
  bgm = defaultbgm;
  bgm.looped = true;
  bgm.play();
}

function setMusic(path) {
  bgm.pause();
  bgm = common.playMusic(path, true);
}

function allClear() {
  let ownedcount = 0;
  console.log("Checking status!");
  for (let index = 0; index < owned.length; index++) {
    var status = checkOwnership(index);
    if (status === true) {
      ownedcount++;
    }
    console.log(ownedcount);
    if (ownedcount >= 35) {
      endGame();
    }
  }
}

function endGame() {
  common.deleteAllCookies();
  document.cookie = `package=${current_package}; path=results.html`;
  document.cookie = `mode=${mode}; path=results.html`;
  document.cookie = `team1score=${getPoints(1)}; path=results.html`;
  document.cookie = `team2score=${getPoints(2)}; path=results.html`;
  common.goToScreen(
    `results.html`
  );
}

await loadPackage();