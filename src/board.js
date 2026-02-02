import Engine from "../engine.js";

let current_package = localStorage.getItem("package");
const package_folder =
  Engine.Variables.RootFolder + Engine.Variables.AssetsFolder + current_package;

let package_content;
let filemanifest = [];

async function loadPackage() {
  try {
    const filesResp = await fetch(`${package_folder}/files.json`);
    package_content = await filesResp.json();

    package_content.files.forEach((file) => {
      filemanifest.push(`${package_folder}/${file}`);
    });

    const settingsResp = await fetch(`${package_folder}/settings.json`);
    settings = await settingsResp.json();

    if (Array.isArray(settings.general?.ownedstart)) {
      owned = settings.general.ownedstart.slice();
    } else {
      owned = [
        -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0,
        0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ];
    }

    if (settings.scripted_settings) {
      movesTeam1 = settings.scripted_settings.team1moves;
      movesTeam2 = settings.scripted_settings.team2moves;
    } else {
      mode = "random";
    }

    loadMandatoryAssets();
  } catch (err) {
    console.error("Failed to load package or settings:", err);
  }
}

let currentTeam = 1;
let currentpos = [0, 0];
let questions;
let coords;
let settings;
let owned;

const TextBoxButtonType = {
  OK: 1,
  YesNo: 2,
};

let bgm;
let defaultbgm;
let track;

let currentquestion;
let currentmove = 0;

let mode = localStorage.getItem("mode");

let movesTeam1;
let movesTeam2;

let isMoving = false;

async function loadMandatoryAssets() {
  const preload = new createjs.LoadQueue(true);
  preload.loadManifest(filemanifest);
  preload.setMaxConnections(60);

  let filesLoaded = 0;
  preload.on("fileload", () => {
    filesLoaded++;
  });

  preload.on("complete", load, this);
}

async function load() {
  try {
    const [coordsResp, questionsResp] = await Promise.all([
      fetch(`${package_folder}/${settings.general.coordsfile}`),
      fetch(`${package_folder}/${settings.general.questionsfile}`),
    ]);
    coords = await coordsResp.json();
    questions = await questionsResp.json();
  } catch (err) {
    console.error("Failed to load coords/questions:", err);
  }

  if (screen?.orientation) {
    screen.orientation.onchange = function () {
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
    };
  }

  console.info("All assets loaded!");

  Engine.Functions.unloadAllStyleSheets();
  Engine.Functions.loadStyleSheet(
    Engine.Variables.RootFolder + Engine.Variables.UtilsFolder + "engine.css"
  );
  Engine.Functions.loadStyleSheet(`${package_folder}/${settings.styles.boardstyle}`);
  
  const loadingEl = document.getElementById("loading");
  const fieldEl = document.getElementById("field");
  const diceEl = document.getElementById("dice");
  const exits = document.getElementsByClassName("exit");
  const scoreEl = document.getElementById("score");

  if (loadingEl) loadingEl.style.display = "none";
  if (fieldEl) fieldEl.style.display = "block";
  if (diceEl) {
    diceEl.style.display = "grid";
    diceEl.onclick = () => throwDice();
  }
  if (exits[0]) exits[0].style.display = "grid";
  if (exits[1]) exits[1].style.display = "grid";
  if (scoreEl) scoreEl.style.display = "grid";

  try {
    if (Array.isArray(settings.sounds.defaultbgm)) {
      const idx = Math.floor(Math.random() * settings.sounds.defaultbgm.length);
      defaultbgm = `${package_folder}/${settings.sounds.defaultbgm[idx]}`;
    } else {
      defaultbgm = `${package_folder}/${settings.sounds.defaultbgm}`;
    }
    bgm = defaultbgm;
    track = Engine.Functions.playTrack(bgm, true);
  } catch (err) {
    console.warn("BGM not available or failed to play:", err);
  }

  currentmove = 1;

  const menuBtn = document.getElementById("exit");
  if (menuBtn) menuBtn.onclick = () => Engine.Functions.goToScreen("menu.html");

  const giveupBtn = document.getElementById("giveup");
  if (giveupBtn) giveupBtn.onclick = () => endGame();
}

function spawnTextBox(cardasset, scale, text, fontSize, buttontype) {
  Engine.Functions.playTrack(`${package_folder}/${settings.sounds.cardsound}`);

  const cover = Engine.Functions.createElement(
    "img",
    "cover",
    "cover",
    Engine.Variables.Page
  );
  cover.style.position = "fixed";
  cover.style.top = "0";
  cover.style.left = "0";
  cover.style.width = "100%";
  cover.style.height = "100%";
  cover.style.zIndex = "1";
  cover.src = `${package_folder}/cover.avif`;

  const card = Engine.Functions.createElement(
    "img",
    "textcard",
    "textcard",
    Engine.Variables.Page
  );
  card.src = `${package_folder}/${cardasset}`;
  card.style.position = "absolute";
  card.style.zIndex = "2";
  card.style.transformOrigin = "center center";
  card.style.scale = scale;

  const cardtext = Engine.Functions.createElement(
    "div",
    "cardtext",
    "cardtext",
    Engine.Variables.Page
  );
  cardtext.innerText = text;
  cardtext.style.position = "absolute";
  cardtext.style.fontSize = fontSize + "vmax";
  cardtext.style.zIndex = "3";

  if (currentquestion) {
    if (currentquestion.textColor) cardtext.style.color = currentquestion.textColor;

    if (currentquestion.image) {
      const cardimage = Engine.Functions.createElement(
        "img",
        "cardimage",
        "cardimage",
        Engine.Variables.Page
      );
      cardimage.src = `${package_folder}/${currentquestion.image}`;
      cardimage.style.position = "absolute";
      cardimage.style.zIndex = "3";
      if (currentquestion.imageScale) cardimage.style.scale = currentquestion.imageScale;
    }

    if (currentquestion.video) {
      Engine.Functions.pauseTrack(track);
      Engine.Functions.playVideo("cutscene", `${package_folder}/${currentquestion.video}`);

      const PlayAgain = Engine.Functions.createElement(
        "button",
        "PlayAgain",
        "PlayAgain",
        Engine.Variables.Page
      );
      PlayAgain.innerText = "Play Again";
      PlayAgain.style.zIndex = "3";
      PlayAgain.onclick = () => {
        PlayAgain.blur();
        Engine.Functions.playTrack(`${package_folder}/${settings.sounds.selectsound}`);
        Engine.Functions.playVideo("cutscene", `${package_folder}/${currentquestion.video}`);
      };

      const videoKeyHandler = (ev) => {
        if ((ev.key === "Enter") && document.getElementById("cutscene")) {
          const video = document.getElementById("cutscene");
          Engine.Functions.stopVideo(video);
        }
      };
      document.addEventListener("keydown", videoKeyHandler);

      document._board_videoKeyHandler = videoKeyHandler;
    }
  }

  const playSelectSound = () => Engine.Functions.playTrack(`${package_folder}/${settings.sounds.selectsound}`);

  switch (buttontype) {
    case TextBoxButtonType.OK:
    case "OK": {
      const OKButton = Engine.Functions.createElement(
        "button",
        "OK",
        "OK",
        Engine.Variables.Page
      );
      OKButton.innerText = "OK";
      OKButton.style.zIndex = "3";
      OKButton.onclick = () => {
        playSelectSound();
        closeTextBox();
        switchTeam();
        if (currentquestion?.successvideo) {
          Engine.Functions.pauseTrack(track);
          Engine.Functions.playVideo("cutscene", `${package_folder}/${currentquestion.successvideo}`);
        }
      };
      break;
    }
    case TextBoxButtonType.YesNo:
    case "YesNo": {
      const YesButton = Engine.Functions.createElement(
        "button",
        "Yes",
        "Yes",
        Engine.Variables.Page
      );
      YesButton.innerText = "Correct";
      YesButton.style.zIndex = "3";
      YesButton.onclick = () => {
        playSelectSound();
        Engine.Functions.playTrack(`${package_folder}/${settings.sounds.winsound}`);
        closeTextBox();
        setOwnership(currentpos[currentTeam - 1], currentTeam);
        editPoints(currentTeam, currentquestion?.score || 0);
        editOwned(currentTeam, 1);
        switchTeam();
        if (currentquestion?.successvideo) {
          Engine.Functions.pauseTrack(track);
          Engine.Functions.playVideo("cutscene", `${package_folder}/${currentquestion.successvideo}`);
        }
      };

      const NoButton = Engine.Functions.createElement(
        "button",
        "No",
        "No",
        Engine.Variables.Page
      );
      NoButton.innerText = "Wrong";
      NoButton.style.zIndex = "3";
      NoButton.onclick = () => {
        playSelectSound();
        Engine.Functions.playTrack(`${package_folder}/${settings.sounds.failsound}`);
        closeTextBox();
        switchTeam();
      };
      break;
    }
    default:
      break;
  }
}

function closeTextBox() {
  ["cover", "textcard", "cardtext", "imagetext", "OK", "Yes", "No", "PlayAgain", "cardimage"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  if (document._board_videoKeyHandler) {
    document.removeEventListener("keydown", document._board_videoKeyHandler);
    delete document._board_videoKeyHandler;
  }

  Engine.Functions.unpauseTrack(track);
}

function throwDice() {
  if (isMoving) return;
  isMoving = true;

  Engine.Functions.unpauseTrack(track);

  const dice = document.getElementById("dice");
  if (dice) dice.style.display = "none";

  let roll;
  switch (mode) {
    case "scripted":
      if (currentTeam === 1) roll = movesTeam1?.[currentmove];
      else roll = movesTeam2?.[currentmove];
      break;
    case "random":
      roll = Math.floor(Math.random() * 6) + 1;
      break;
    default:
      roll = 1;
      break;
  }

  Engine.Functions.playTrack(`${package_folder}/${settings.sounds.dicesound}`);
  gotoPos(currentTeam, currentpos[currentTeam - 1] + roll);

  const ownership = checkOwnership(currentpos[currentTeam - 1]);
  if (ownership === false || ownership === null) {
    currentquestion = questions?.[currentpos[currentTeam - 1]];
    if (currentquestion) {
      spawnTextBox(
        currentquestion.cardAsset,
        currentquestion.scale,
        currentquestion.text,
        currentquestion.fontSize,
        currentquestion.buttonType
      );
      if (currentquestion.musicOverride) setMusic(`${package_folder}/${currentquestion.musicOverride}`);
    } else {
      switchTeam();
    }
  } else {
    switchTeam();
  }

  if (dice) dice.style.display = "unset";
  isMoving = false;
}

function editPoints(team, value) {
  const score = document.getElementById("score" + team);
  if (!score) return;
  const newVal = parseInt(score.innerText || "0", 10) + Number(value || 0);
  score.innerText = String(newVal);
}

function editOwned(team, value) {
  const ownedEl = document.getElementById("owned" + team);
  if (!ownedEl) return;
  const newVal = parseInt(ownedEl.innerText || "0", 10) + Number(value || 0);
  ownedEl.innerText = String(newVal);
}

function getPoints(team) {
  const score = document.getElementById("score" + team);
  return parseInt(score?.innerText || "0", 10);
}

function setPos(team, x, y) {
  const player = document.getElementById("player" + team);
  if (!player) return;

  const leftValue = team === 2 ? x - 7 : x;
  player.style.bottom = `${y}%`;
  player.style.left = `${leftValue}%`;
}

function gotoPos(team, pos) {
  currentpos[team - 1] = pos;
  if (pos > 39) {
    currentpos[team - 1] = 0;
    setPos(team, coords?.[0]?.X ?? 0, coords?.[0]?.Y ?? 0);
    allClear();
  } else {
    const p = coords?.[pos];
    if (p) setPos(team, p.X, p.Y);
  }
}

function getPos(pos) {
  return coords?.[pos];
}

function setOwnership(pos, team) {
  if (checkOwnership(pos) === false) {
    owned[pos] = team;
  }
}

function switchTeam() {
  if (currentTeam === 1) {
    currentTeam = 2;
  } else {
    currentTeam = 1;
    currentmove++;
    if (currentmove > 9 && mode === "scripted") endGame();
  }
}

function checkOwnership(pos) {
  const val = owned?.[pos];
  if (val === 0) return false;
  if (val === 1 || val === 2) return true;
  return null;
}

function setMusic(path) {
  try {
    Engine.Functions.pauseTrack(track);
    bgm = Engine.Functions.playMusic(path, true);
  } catch (err) {
    console.warn("Failed to set music:", err);
  }
}

function allClear() {
  if (!Array.isArray(owned)) return;
  const ownedcount = owned.reduce((count, entry) => (entry === 1 || entry === 2 ? count + 1 : count), 0);
  if (ownedcount >= 35) {
    endGame();
  }
}

function endGame() {
  localStorage.setItem("team1", String(getPoints(1)));
  localStorage.setItem("team2", String(getPoints(2)));
  Engine.Functions.goToScreen(`results.html`);
}

await loadPackage();
