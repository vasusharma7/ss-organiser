const electron = require("electron");
const ipc = electron.ipcRenderer;

document.getElementById("trigger").addEventListener("click", () => {
  ipc.send("capture");
});
