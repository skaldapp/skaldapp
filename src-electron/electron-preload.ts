import type {
  DeleteObjectCommandInput,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  HeadObjectCommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import type { StreamingBlobPayloadOutputTypes } from "@smithy/types";

import { dialog } from "@electron/remote";
import { contextBridge } from "electron";
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
import { basename, dirname, join } from "path";

const deleteObject = async ({ Bucket, Key }: DeleteObjectCommandInput) => {
    if (Bucket !== undefined && Key !== undefined)
      await unlink(join(Bucket, Key));
  },
  getObject = async ({
    Bucket,
    Key,
  }: GetObjectCommandInput): Promise<GetObjectCommandOutput> => {
    const $metadata = {};
    if (Bucket !== undefined && Key !== undefined) {
      const [body, { default: mime }] = await Promise.all([
          readFile(join(Bucket, Key)),
          import("mime"),
        ]),
        Body = new Blob([body]) as StreamingBlobPayloadOutputTypes,
        ContentType = mime.getType(Key) ?? undefined;
      return {
        $metadata,
        Body,
        ContentType,
      };
    } else return { $metadata };
  },
  headObject = async ({ Bucket, Key }: HeadObjectCommandInput) => {
    if (Bucket !== undefined && Key !== undefined) {
      const stats = await lstat(join(Bucket, Key));
      if (stats.isFile()) return undefined;
    }
    throw new Error("It's not a file");
  },
  putObject = async ({ Body, Bucket, Key }: PutObjectCommandInput) => {
    if (Bucket !== undefined && Key !== undefined) {
      const filePath = join(Bucket, Key),
        dirName = dirname(filePath);
      try {
        await access(dirName);
      } catch {
        await mkdir(dirName, { recursive: true });
      }
      await writeFile(filePath, Body as string | Uint8Array);
    }
  },
  removeEmptyDirectories = async (directory: string, exclude: string[]) => {
    const fileStats = await lstat(directory);
    if (!fileStats.isDirectory() || exclude.includes(basename(directory)))
      return;
    let fileNames = await readdir(directory);
    if (fileNames.length) {
      await Promise.all(
        fileNames.map((fileName) =>
          removeEmptyDirectories(join(directory, fileName), exclude),
        ),
      );
      fileNames = await readdir(directory);
    }
    if (!fileNames.length) await rmdir(directory);
  };

Object.entries({
  deleteObject,
  dialog,
  getObject,
  headObject,
  putObject,
  removeEmptyDirectories,
}).forEach(([apiKey, api]) => {
  contextBridge.exposeInMainWorld(apiKey, api);
});
