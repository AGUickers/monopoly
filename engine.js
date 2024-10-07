import "./lib/jquery.js";
const $ = window.$;

let Functions = {
  fetchFiles: async function (folder) {
    await fetch(`${folder}/files.json`)
      .then((response) => response.json())
      .then((json) => {
        json.files.forEach((file) => {
          Variables.GameContent.push(folder + file);
        });
      });
  },

  loadAssets: async function (callback) {
    await this.fetchFiles(Variables.RootFolder + Variables.AssetsFolder);
    Functions.log("Loading files...");
    var preload = new createjs.LoadQueue(true);
    let count = 0;
    preload.loadManifest(Variables.GameContent);
    preload.setMaxConnections(60);
    preload.on(
      "fileload",
      function () {
        count++;
        Functions.log("Files loaded: " + count);
      },
      this
    );
    preload.on("complete", callback, this);
    Functions.log("Done!");
  },

  playTrack: function (file, loop) {
    let sound = new Audio(Variables.RootFolder + Variables.AssetsFolder + file);
    Variables.Page.appendChild(sound);
    sound.loop = loop;
    sound.volume = localStorage.getItem("volume");
    sound.play();
    return sound;
  },

  pauseTrack: function (sound) {
    sound.pause();
  },

  unpauseTrack: function (sound) {
    sound.play();
  },

  stopTrack: function (sound) {
    sound.pause();
    sound.currentTime = 0;
  },

  playVideo: function (videoid, file) {
    let element = document.createElement("video");
    element.id = videoid;
    element.className = "fullscreen";
    Variables.Page.appendChild(element);
    let video = document.getElementById(videoid);
    video.src = Variables.RootFolder + Variables.AssetsFolder + file;
    video.play();
    video.onended = function () {
      Functions.stopVideo(video);
    };
    return video;
  },

  pauseVideo: function (video) {
    video.pause();
  },

  stopVideo: function (video) {
    video.pause();
    video.currentTime = 0;
    video.remove();
  },

  displayMessageBox: function (message, type) {
    switch (type) {
      case Enums.MessageBoxType.OK:
        alert(message);
        break;
      case Enums.MessageBoxType.YesNo: {
        let result = confirm(message);
        if (result) {
          return true;
        } else {
          return false;
        }
      }
      case Enums.MessageBoxType.Text: {
        let result = prompt(message);
        if (result) {
          return result;
        } else {
          return false;
        }
      }
    }
  },

  createElement: function (elementName, id, className, parent) {
    let element = document.createElement(elementName);
    element.id = id;
    element.className = className;
    parent.appendChild(element);
    return element;
  },

  showElement: function (element) {
    $(`#${element}`).css("display", "block");
  },

  hideElement: function (element) {
    $(`#${element}`).css("display", "none");
  },

  loadStyleSheet: function (file) {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = Variables.RootFolder + Variables.AssetsFolder + file;
    document.head.appendChild(link);
  },

  unloadStylesheet: function (file) {
    let children = Array.from(document.head.children);
    children.forEach((child) => {
      if (child.type === "text/css" && child.href.endsWith(file))
        child.disabled = true;
    });
  },

  unloadAllStyleSheets: function () {
    let allStyles = Array.from(document.styleSheets);
    allStyles.forEach((style) => {
      style.disabled = true;
    });
    let children = Array.from(document.head.children);
    children.forEach((child) => {
      if (child.type === "text/css") child.disabled = true;
    });
  },

  loadScript: function (file) {
    let script = document.createElement("script");
    script.src = Variables.RootFolder + Variables.ScriptsFolder + file;
    script.type = "module"
    document.head.appendChild(script);
  },

  loadExternalScript: function (file, type) {
    let script = document.createElement("script");
    script.src = file;
    script.type = type;
    document.head.appendChild(script);
  },

  goToScreen: function (page) {
    window.location.href = page;
  },

  enableDebug: function () {
    Functions.log = function (d) {
      if (document.getElementById("log") !== null) document.getElementById("log").innerText = d;
      console.log(d);
    }
    let debug_info = document.createElement("div");
    debug_info.id = "debug_info";
    Variables.Page.appendChild(debug_info);
    $("#debug_info").css("display", "block");
    $("#debug_info").load(
      Variables.RootFolder + Variables.UtilsFolder + "gameinfo.html", function () {
        Functions.log("Engine loaded successfully!");
      }
    );
  },
  
  addVolume: function () {
    if (localStorage.getItem("volume") === null) localStorage.setItem("volume", 0.7);
    let volume = document.createElement("img");
    volume.id = "volume";
    if (localStorage.getItem("volume") === 0) volume.src = Variables.RootFolder + Variables.AssetsFolder + "volume_up.avif";
    else volume.src = Variables.RootFolder + Variables.AssetsFolder + "volume_off.avif";
    Variables.Page.appendChild(volume);
    $("#volume").css("display", "block");
    let volumediv = document.createElement("div");
    volumediv.id = "volumediv";
    Variables.Page.appendChild(volumediv);
    $("#volumediv").load(
      Variables.RootFolder + Variables.UtilsFolder + "volume.html", function() {
        $("#sound").val(localStorage.getItem("volume"));
        if ($("#sound").val() > 0) volume.src = Variables.RootFolder + Variables.AssetsFolder + "volume_up.avif";
        else volume.src = Variables.RootFolder + Variables.AssetsFolder + "volume_off.avif";
        $("#sound").on("change", function() {
          Array.from(document.getElementsByTagName('audio')).forEach(track => {
            track.volume = $(this).val();
          });
          Array.from(document.getElementsByTagName('video')).forEach(track => {
            track.volume = $(this).val();
          });
          localStorage.setItem("volume", $(this).val());
          if ($(this).val() > 0) volume.src = Variables.RootFolder + Variables.AssetsFolder + "volume_up.avif";
          else volume.src = Variables.RootFolder + Variables.AssetsFolder + "volume_off.avif";
        });
      }
    );
    volume.onclick = function () {
      if ($("#volumediv").css("display") === "none") $("#volumediv").css("display", "block");
      else $("#volumediv").css("display", "none");
    };
  },

  log: function (d) {
    console.log(d);
  },  

  exit: function () {
    window.close();
  },
};

let Enums = {
  MessageBoxType: {
    OK: 0,
    YesNo: 1,
    Text: 2,
    Custom: 3,
  },
};

let Variables = {
  NetworkStatus: navigator.onLine,
  Page: document.body,
  MaxHeight: screen.availHeight,
  MaxWidth: screen.availWidth,
  PageName: location.pathname.substring(location.pathname.lastIndexOf("/") + 1).split(".")[0],
  RootFolder: "../",
  LibraryFolder: "lib/",
  AssetsFolder: "assets/",
  PagesFolder: "pages/",
  ScriptsFolder: "src/",
  UtilsFolder: "utils/",
  GameContent: [],
  DebugMode: new URL(document.location.toString()).searchParams.get("debug"),
};

function init() {
  if (Variables.DebugMode === "true") {
    Functions.enableDebug();
  }
  Functions.loadStyleSheet(
    Variables.RootFolder + Variables.UtilsFolder + "engine.css"
  );
  Functions.loadScript(
    Variables.RootFolder + Variables.ScriptsFolder + `${Variables.PageName}.js`
  );
  Functions.loadExternalScript(Variables.RootFolder + Variables.LibraryFolder + "preload.js");
}

init();

export default {
  Functions,
  Enums,
  Variables,
};
