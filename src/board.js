import Engine from "../engine.js";

let current_package = localStorage.getItem("package");

let package_folder =
  Engine.Variables.RootFolder + Engine.Variables.AssetsFolder + current_package;
let package_content = undefined;
let filemanifest = [];

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
              -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1,
              0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
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

let track = undefined;

let currentquestion = undefined;
let currentmove = 0;

let mode = localStorage.getItem("mode");

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
    this,
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
  Engine.Functions.unloadAllStyleSheets();
  Engine.Functions.loadStyleSheet(
    Engine.Variables.RootFolder + Engine.Variables.UtilsFolder + "engine.css"
  );
  Engine.Functions.loadStyleSheet(
    `${package_folder}/${settings.styles.boardstyle}`,
  );
  document.getElementById("loading").style.display = "none";
  document.getElementById("field").style.display = "block";
  document.getElementById("dice").style.display = "grid";
  document.getElementsByClassName("exit")[0].style.display = "grid";
  document.getElementsByClassName("exit")[1].style.display = "grid";
  document.getElementById("score").style.display = "grid";
  switch (Array.isArray(settings.sounds.defaultbgm)) {
    case true:
      let roll = Math.floor(Math.random() * settings.sounds.defaultbgm.length);
      defaultbgm = `${package_folder}/${settings.sounds.defaultbgm[roll]}`
      break;
    case false:
      defaultbgm = `${package_folder}/${settings.sounds.defaultbgm}`
      break;
    default:
      break;
  }
  bgm = defaultbgm;
  track = Engine.Functions.playTrack(bgm, true);
  currentmove = 1;
  const menu = document.getElementById("exit");
  menu.onclick = function () {
    Engine.Functions.goToScreen("menu.html");
  };
  const giveup = document.getElementById("giveup");
  giveup.onclick = function () {
    endGame();
  };
  const dice = document.getElementById("dice");
  dice.onclick = function () {
    throwDice();
  };
}

function spawnTextBox(cardasset, scale, text, fontSize, buttontype) {
  Engine.Functions.playTrack(`${package_folder}/${settings.sounds.cardsound}`);
  //Let's cover the entire page with a file named "cover.avif"
  const cover = Engine.Functions.createElement(
    "img",
    "cover",
    "cover",
    Engine.Variables.Page,
  );
  cover.style.zIndex = "1";
  cover.src = `${package_folder}/cover.avif`;
  cover.style.width = "100%";
  cover.style.height = "100%";
  cover.style.position = "fixed";
  cover.style.top = "0";
  cover.style.left = "0";

  const card = Engine.Functions.createElement(
    "img",
    "textcard",
    "textcard",
    Engine.Variables.Page,
  );
  card.src = `${package_folder}/${cardasset}`;
  card.style.position = "absolute";
  card.style.zIndex = "2";
  card.style.scale = scale;

  const cardtext = Engine.Functions.createElement(
    "div",
    "cardtext",
    "cardtext",
    Engine.Variables.Page,
  );
  cardtext.innerText = text;
  cardtext.style.position = "absolute";
  cardtext.style.zIndex = "3";
  cardtext.style.fontSize = fontSize + "vmax";

  if (currentquestion) {
    cardtext.style.color = currentquestion.textColor;
    if (currentquestion.image) {
      const cardimage = Engine.Functions.createElement(
        "img",
        "cardimage",
        "cardimage",
        Engine.Variables.Page,
      );
      cardimage.src = `${package_folder}/${currentquestion.image}`;
      cardimage.style.zIndex = "3";
      cardimage.style.position = "absolute";
      if (currentquestion.imageScale)
        cardimage.style.scale = currentquestion.imageScale;
    }

    if (currentquestion.video) {
      Engine.Functions.pauseTrack(track);
      Engine.Functions.playVideo(
        "cutscene",
        `${package_folder}/${currentquestion.video}`,
      );
      const PlayAgain = Engine.Functions.createElement(
        "button",
        "PlayAgain",
        "PlayAgain",
        Engine.Variables.Page,
      );
      PlayAgain.innerText = "Play Again";
      PlayAgain.style.zIndex = "3";
      PlayAgain.onclick = function () {
        PlayAgain.blur();
        Engine.Functions.playTrack(
          `${package_folder}/${settings.sounds.selectsound}`,
        );
        Engine.Functions.playVideo(
          "cutscene",
          `${package_folder}/${currentquestion.video}`,
        );
      };
      document.onkeydown = (ev) => {
        if (ev.key === "Enter" && document.getElementById("cutscene")) {
          Engine.Functions.stopVideo("cutscene");
        }
      };
    }
  }

  switch (buttontype) {
    case TextBoxButtonType.OK:
    case "OK":
      const OKButton = Engine.Functions.createElement(
        "button",
        "OK",
        "OK",
        Engine.Variables.Page,
      );
      OKButton.innerText = "OK";
      OKButton.style.zIndex = "3";
      OKButton.onclick = function () {
        Engine.Functions.playTrack(
          `${package_folder}/${settings.sounds.selectsound}`,
        );
        closeTextBox();
        switchTeam();
        if (currentquestion.successvideo) {
          Engine.Functions.pauseTrack(track);
          Engine.Functions.playVideo(
            "cutscene",
            `${package_folder}/${currentquestion.successvideo}`,
          );
          document.onkeydown = (ev) => {
            if (ev.key === "Enter") {
              Engine.Functions.stopVideo("cutscene");
            }
          };
        }
      };
      break;
    case TextBoxButtonType.YesNo:
    case "YesNo":
      const YesButton = Engine.Functions.createElement(
        "button",
        "Yes",
        "Yes",
        Engine.Variables.Page,
      );
      YesButton.innerText = "Correct";
      YesButton.style.zIndex = "3";
      YesButton.onclick = function () {
        Engine.Functions.playTrack(
          `${package_folder}/${settings.sounds.selectsound}`,
        );
        Engine.Functions.playTrack(
          `${package_folder}/${settings.sounds.winsound}`,
        );
        closeTextBox();
        //Let's set the ownership.
        setOwnership(currentpos[currentTeam - 1], currentTeam);
        //Let's also award some points.
        editPoints(currentTeam, currentquestion.score);
        editOwned(currentTeam, 1);
        switchTeam();
        if (currentquestion.successvideo) {
          Engine.Functions.pauseTrack(track);
          Engine.Functions.playVideo(
            "cutscene",
            `${package_folder}/${currentquestion.successvideo}`,
          );
          document.onkeydown = (ev) => {
            if (ev.key === "Enter") {
              Engine.Functions.stopVideo("cutscene");
            }
          };
        }
      };
      const NoButton = Engine.Functions.createElement(
        "button",
        "No",
        "No",
        Engine.Variables.Page,
      );
      NoButton.innerText = "Wrong";
      NoButton.style.zIndex = "3";
      NoButton.onclick = function () {
        Engine.Functions.playTrack(
          `${package_folder}/${settings.sounds.selectsound}`,
        );
        Engine.Functions.playTrack(
          `${package_folder}/${settings.sounds.failsound}`,
        );
        closeTextBox();
        switchTeam();
      };
      break;
  }
}

function closeTextBox() {
  const cover = document.getElementById("cover");
  const card = document.getElementById("textcard");
  const cardtext = document.getElementById("cardtext");
  const imagetext = document.getElementById("imagetext");
  const OKButton = document.getElementById("OK");
  const YesButton = document.getElementById("Yes");
  const NOButton = document.getElementById("No");
  const PlayAgain = document.getElementById("PlayAgain");
  const cardimage = document.getElementById("cardimage");
  if (cover) cover.remove();
  if (card) card.remove();
  if (cardtext) cardtext.remove();
  if (imagetext) imagetext.remove();
  if (OKButton) OKButton.remove();
  if (YesButton) YesButton.remove();
  if (NOButton) NOButton.remove();
  if (PlayAgain) PlayAgain.remove();
  if (cardimage) cardimage.remove();
  Engine.Functions.unpauseTrack(track);
}

function throwDice() {
  Engine.Functions.unpauseTrack(track);
  //Let's get a number from 1 to 6 first.
  const dice = document.getElementById("dice");
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
  Engine.Functions.playTrack(`${package_folder}/${settings.sounds.dicesound}`);
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
        currentquestion.buttonType,
      );
      if (currentquestion.musicOverride)
        setMusic(`${package_folder}/${currentquestion.musicOverride}`);
    } else switchTeam();
  } else switchTeam();
  dice.style.display = "unset";
}

function editPoints(team, value) {
  const score = document.getElementById("score" + team);
  score.innerText = parseInt(score.innerText, 10) + value;
}

function editOwned(team, value) {
  const owned = document.getElementById("owned" + team);
  owned.innerText = parseInt(owned.innerText, 10) + value;
}

function getPoints(team) {
  const score = document.getElementById("score" + team);
  return parseInt(score.innerText, 10);
}

function setPos(team, x, y) {
  const player = document.getElementById("player" + team);
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
    owned[pos] = team;
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

function setMusic(path) {
  Engine.Functions.pauseTrack(track);
  bgm = Engine.Functions.playMusic(path, true);
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
  localStorage.setItem("team1", getPoints(1));
  localStorage.setItem("team2", getPoints(2));
  Engine.Functions.goToScreen(`results.html`);
}

await loadPackage();
