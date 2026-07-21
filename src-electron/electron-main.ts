import { app, BrowserWindow, dialog, ipcMain, Menu, screen } from "electron";
import electronUpdater from "electron-updater";
import {
  access,
  lstat,
  mkdir,
  readdir,
  readFile,
  rmdir,
  unlink,
  writeFile,
} from "fs/promises";
import mime from "mime";
import { basename, dirname, join } from "path";

import {
  registerQuasarRuntime,
  resolveElectronAssetsPath,
} from "#q-app/electron/main";

const devTools = false,
  icon = resolveElectronAssetsPath("icons/icon.png"),
  preload = join(import.meta.dirname, "electron-preload.cjs"),
  removeEmptyDirectories = async (
    event: Electron.IpcMainInvokeEvent | null,
    directory: string,
    exclude: string[],
  ) => {
    const fileStats = await lstat(directory);
    if (fileStats.isDirectory() && !exclude.includes(basename(directory))) {
      let fileNames = await readdir(directory);
      if (fileNames.length) {
        await Promise.all(
          fileNames.map((fileName) =>
            removeEmptyDirectories(null, join(directory, fileName), exclude),
          ),
        );
        fileNames = await readdir(directory);
      }
      if (!fileNames.length) await rmdir(directory);
    }
  },
  webPreferences = { devTools, preload };

const createWindow = async () => {
  const {
      workAreaSize: { height, width },
    } = screen.getPrimaryDisplay(),
    mainWindow = new BrowserWindow({
      height,
      icon,
      webPreferences,
      width,
    });
  if (import.meta.env.QUASAR_DEV)
    await mainWindow.loadURL(import.meta.env.QUASAR_APP_URL);
  else await mainWindow.loadFile("index.html");
};

Menu.setApplicationMenu(null);

ipcMain.handle("fs:deleteObject", async (event, { Bucket, Key }) => {
  if (Bucket !== undefined && Key !== undefined)
    await unlink(join(Bucket, Key));
});
ipcMain.handle("fs:getObject", async (event, { Bucket, Key }) => {
  const $metadata = {};
  if (Bucket !== undefined && Key !== undefined) {
    const Body = await readFile(join(Bucket, Key)),
      ContentType = mime.getType(Key) ?? undefined;
    return { $metadata, Body, ContentType };
  } else return { $metadata };
});
ipcMain.handle("fs:headObject", async (event, { Bucket, Key }) => {
  if (Bucket !== undefined && Key !== undefined) {
    const stats = await lstat(join(Bucket, Key));
    if (stats.isFile()) return undefined;
  }
  throw new Error("It's not a file");
});
ipcMain.handle("fs:putObject", async (event, { Body, Bucket, Key }) => {
  if (Bucket !== undefined && Key !== undefined) {
    const filePath = join(Bucket, Key),
      dirName = dirname(filePath);
    try {
      await access(dirName);
    } catch {
      await mkdir(dirName, { recursive: true });
    }
    await writeFile(filePath, Body);
  }
});
ipcMain.handle("fs:removeEmptyDirectories", removeEmptyDirectories);
ipcMain.handle("dialog:showOpenDialog", async (event, options) => {
  return await dialog.showOpenDialog(options);
});

void app.whenReady().then(async () => {
  // eslint-disable-next-line import-x/no-named-as-default-member
  const { autoUpdater } = electronUpdater;
  void autoUpdater.checkForUpdatesAndNotify();
  await registerQuasarRuntime();
  void createWindow();
  app.on("activate", () => {
    if (!BrowserWindow.getAllWindows().length) void createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
