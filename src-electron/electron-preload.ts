import type {
  DeleteObjectCommandInput,
  GetObjectCommandInput,
  HeadObjectCommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

import { contextBridge, ipcRenderer } from "electron";

import { quasarRuntime } from "#q-app/electron/preload";

const deleteObject = (input: DeleteObjectCommandInput) =>
    ipcRenderer.invoke("fs:deleteObject", input),
  getObject = (input: GetObjectCommandInput) =>
    ipcRenderer.invoke("fs:getObject", input),
  headObject = (input: HeadObjectCommandInput) =>
    ipcRenderer.invoke("fs:headObject", input),
  putObject = (input: PutObjectCommandInput) =>
    ipcRenderer.invoke("fs:putObject", input),
  removeEmptyDirectories = (directory: string, exclude: string[]) =>
    ipcRenderer.invoke("fs:removeEmptyDirectories", directory, exclude),
  showOpenDialog = (options: Electron.OpenDialogOptions) =>
    ipcRenderer.invoke("dialog:showOpenDialog", options);

Object.entries({
  deleteObject,
  getObject,
  headObject,
  putObject,
  quasarRuntime,
  removeEmptyDirectories,
  showOpenDialog,
}).forEach(([apiKey, api]) => {
  contextBridge.exposeInMainWorld(apiKey, api);
});
