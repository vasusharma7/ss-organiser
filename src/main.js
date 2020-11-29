const electron = require("electron");
const {
  app,
  Tray,
  Menu,
  BrowserWindow,
  globalShortcut,
  ipcMain: ipc,
  shell,
  Notification,
} = electron;
const activeWin = require("active-win");

const fs = require("fs");
const path = require("path");
var AutoLaunch = require("auto-launch");
// var mainWindow = null;
const screenshot = require("screenshot-desktop");
const moment = require("moment");
const shelljs = require("shelljs");

let autoLaunch = new AutoLaunch({
  name: "SSOrgniser",
});
autoLaunch.isEnabled().then((isEnabled) => {
  if (!isEnabled) autoLaunch.enable();
});
app.on("ready", (_) => {
  // mainWindow = new BrowserWindow({
  //   width: 0,
  //   height: 0,
  //   webPreferences: {
  //     nodeIntegration: true,
  //   },
  // });
  // mainWindow.loadURL(`file://${__dirname}/index.html`);
  tray = new Tray(path.join(__dirname, "assets/ss.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "SS Organiser",
      click: function () {
        let address = appPath();
        if (!fs.existsSync(address)) shelljs.mkdir("-p", address);
        shell.openPath(address);
      },
    },
    {
      label: "Quit",
      click: function () {
        // mainWindow = null;
        app.quit();
      },
    },
  ]);
  tray.setToolTip("SSOrganiser - Keep your screenshots categorised");
  tray.setContextMenu(contextMenu);

  // mainWindow.on("closed", (_) => {
  // mainWindow = null;
  // });
  // mainWindow.hide();
});

function getFileName() {
  var date = moment.utc().format("YYYY-MM-DD HH:mm:ss");

  console.log(date);

  var stillUtc = moment.utc(date).toDate();
  var local = moment(stillUtc).local().format("YYYY-MM-DD HH:mm:ss");

  return local + ".png";
}

const appPath = () => path.join(app.getPath("pictures"), "SSOrganiser");
const save = (img) => {
  (async () => {
    const result = await activeWin();
    let address = null;
    if (!(result && result.title && result.owner && result.owner.name))
      address = path.join(appPath(), "general");
    else {
      address = path.join(
        appPath(),
        result.owner.name,
        result.title.replace("/", "-")
      );
    }
    if (!fs.existsSync(address)) {
      shelljs.mkdir("-p", address);
    }
    const fileName = path.join(address, getFileName());
    const fileContents = new Buffer.from(img);
    fs.writeFile(fileName, fileContents, (err) => {
      if (err) return console.error(err);
      showNotification();
      console.log("file saved to ", fileName);
    });
  })();
};
const capture = () => {
  screenshot()
    .then((img) => {
      save(img);
    })
    .catch((err) => {
      console.log(err);
    });
};

// ipc.on("capture", () => {
//   capture();
// });

app.whenReady().then(() => {
  const ret = globalShortcut.register("CommandOrControl+Shift+S", () => {
    capture();
  });

  if (!ret) {
    console.log("registration failed");
  }
  console.log(globalShortcut.isRegistered("CommandOrControl+Shift+S"));
});

app.on("will-quit", () => {
  // Unregister a shortcut.
  globalShortcut.unregister("CommandOrControl+Shift+S");

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

const showNotification = () => {
  const notification = {
    title: "SS Organiser",
    body: "Screenshot captured",
  };
  new Notification(notification).show();
};
