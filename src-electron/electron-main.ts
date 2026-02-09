import { enable, initialize } from "@electron/remote/main/index.js";
import { app, BrowserWindow, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";

let mainWindow: BrowserWindow | undefined;

const currentDir = fileURLToPath(new URL(".", import.meta.url)),
  devTools = false,
  icon = path.resolve(currentDir, "icons/icon.png"),
  preload = path.resolve(
    currentDir,
    path.join(
      process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
      `electron-preload${process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION}`,
    ),
  ),
  sandbox = false,
  show = false,
  webPreferences = { devTools, preload, sandbox },
  width = 1000;

const createWindow = async () => {
  mainWindow = new BrowserWindow({ icon, show, webPreferences, width });
  enable(mainWindow.webContents);
  if (process.env.DEV) await mainWindow.loadURL(process.env.APP_URL);
  else await mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
  mainWindow.show();
};

initialize();
Menu.setApplicationMenu(null);
void app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (mainWindow === undefined) void createWindow();
});
