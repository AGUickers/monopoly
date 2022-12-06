const { app, BrowserWindow, Menu, dialog } = require("electron");
const fs = require("fs-extra");

async function scan(folder) {
  let files = fs.readdirSync(folder);
  if (files.includes("files.json"))
    files.splice(files.indexOf("files.json"), 1);
  let filelist = {
    files: files,
  };
  fs.writeJsonSync(`${folder}/files.json`, filelist);
  files.forEach((file) => {
    if (
      fs.statSync(folder + "/" + file).isDirectory()
    ) {
      scan(folder + "/" + file);
    }
  });
}

let projectFile = undefined;
function getProjectFile() {
  if (fs.existsSync("./project.json")) {
    projectFile = JSON.parse(fs.readFileSync("./project.json"));
    return projectFile;
  }
  if (fs.existsSync("resources/app/project.json")) {
    projectFile = JSON.parse(fs.readFileSync("resources/app/project.json"));
    return projectFile;
  }
}

let debug = undefined;

const createWindow = () => {
  scan("./assets");
  let width =
    parseInt(app.commandLine.getSwitchValue("width"), 10) ||
    projectFile.targetWidth;
  let height =
    parseInt(app.commandLine.getSwitchValue("height"), 10) ||
    projectFile.targetHeight;
  debug = app.commandLine.getSwitchValue("debugmode") === "true";
  let fullscreen =
    app.commandLine.getSwitchValue("fullscreen") === "true" ||
    projectFile.fullScreen;
  let page = app.commandLine.getSwitchValue("page") || projectFile.defaultPage;
  const win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      devTools: debug,
    },
    autoHideMenuBar: !debug,
    fullscreen: fullscreen,
    resizable: true,
  });
  //Load file from the argument passed from the command line.
  win.loadFile(page);
};

const menustructure = [
  {
    label: "Debug Tools",
    submenu: [
      {
        label: "Reload",
        accelerator: process.platform === "darwin" ? "Command+R" : "Ctrl+R",
        click(item, focusedWindow) {
          focusedWindow.reload();
        },
      },
      {
        label: "Toggle DevTools",
        accelerator: process.platform === "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        label: "Toggle Full Screen",
        accelerator: "F11",
        click(item, focusedWindow) {
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        },
      },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "About",
        click() {
          dialog.showMessageBox({
            type: "info",
            title: "About",
            message:
              "Grammar Engine - A simple game engine for learning English.\nBuild: DevTest Build\nPowered by Electron.",
            buttons: ["OK"],
          });
        },
      },
    ],
  },
];

app.whenReady().then(() => {
  getProjectFile();
  createWindow();
  if (debug === true) {
    const appMenu = Menu.buildFromTemplate(menustructure);
    Menu.setApplicationMenu(appMenu);
  } else {
    Menu.setApplicationMenu(null);
  }
});
