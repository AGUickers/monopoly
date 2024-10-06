const { app, BrowserWindow, Menu, dialog } = require("electron");
const fs = require("fs");

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
  if (fs.existsSync("resources/app.asar/project.json")) {
    projectFile = JSON.parse(
      fs.readFileSync("resources/app.asar/project.json")
    );
    return projectFile;
  }
}

let build = undefined;
function getBuild() {
  if (fs.existsSync("./build.txt")) {
    build = fs.readFileSync("./build.txt");
    return build;
  }
  if (fs.existsSync("resources/app/build.txt")) {
    build = fs.readFileSync("resources/app/build.txt");
    return build;
  }
  if (fs.existsSync("resources/app.asar/build.txt")) {
    build = fs.readFileSync("resources/app.asar/build.txt");
    return build;
  }
}

let debug = undefined;

const createWindow = () => {
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
  win.loadFile(`${page}?debug=${debug}`);
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
              `Grammar Engine (build ${build})\n\nPowered by Electron.`,
            buttons: ["OK"],
          });
        },
      },
    ],
  },
];

app.whenReady().then(() => {
  getProjectFile();
  getBuild();
  createWindow();
  if (debug === true) {
    const appMenu = Menu.buildFromTemplate(menustructure);
    Menu.setApplicationMenu(appMenu);
  } else {
    Menu.setApplicationMenu(null);
  }
});