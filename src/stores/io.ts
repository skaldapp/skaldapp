import type { StreamingBlobPayloadInputTypes } from "@smithy/types";

import * as fsa from "@skaldapp/fsa";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useS3Store } from "stores/s3";
import { ref } from "vue";

export const useIoStore = defineStore("io", () => {
  let fileSystemDirectoryHandle: FileSystemDirectoryHandle | undefined,
    remote = false;

  const s3 = useS3Store();
  const io = () => (remote ? s3 : window);
  const bucket = ref(""),
    deleteObject = async (Key: string) => {
      if (bucket.value)
        if (fileSystemDirectoryHandle)
          await fsa.deleteObject(fileSystemDirectoryHandle, Key);
        else await io().deleteObject(bucket.value, Key);
    },
    getObjectBlob = async (Key: string, ResponseCacheControl?: string) => {
      if (fileSystemDirectoryHandle)
        return fsa.getObjectBlob(fileSystemDirectoryHandle, Key);
      return io().getObjectBlob(bucket.value, Key, ResponseCacheControl);
    },
    getObjectText = async (Key: string, ResponseCacheControl?: string) => {
      if (fileSystemDirectoryHandle)
        return fsa.getObjectText(fileSystemDirectoryHandle, Key);
      return io().getObjectText(bucket.value, Key, ResponseCacheControl);
    },
    headBucket = async (Bucket: string, pin: string | undefined) => {
      try {
        await s3.headBucket(Bucket, pin);
        remote = true;
      } catch (err) {
        const { message } = err as Error;
        throw new Error(message);
      }
    },
    headObject = async (Key: string, ResponseCacheControl?: string) => {
      if (fileSystemDirectoryHandle)
        return fsa.headObject(fileSystemDirectoryHandle, Key);
      return io().headObject(bucket.value, Key, ResponseCacheControl);
    },
    putObject = async (
      Key: string,
      body: StreamingBlobPayloadInputTypes,
      ContentType: string,
    ) => {
      if (bucket.value)
        if (fileSystemDirectoryHandle)
          await fsa.putObject(fileSystemDirectoryHandle, Key, body);
        else await io().putObject(bucket.value, Key, body, ContentType);
    },
    removeEmptyDirectories = async () => {
      const exclude = ["node_modules", ".git"];
      if (bucket.value)
        if (fileSystemDirectoryHandle)
          await fsa.removeEmptyDirectories(fileSystemDirectoryHandle, exclude);
        else await io().removeEmptyDirectories?.(bucket.value, exclude);
    },
    reset = () => {
      bucket.value = "";
      s3.setS3Client();
      remote = false;
      fileSystemDirectoryHandle = undefined;
    },
    setFileSystemDirectoryHandle = (value: FileSystemDirectoryHandle) => {
      fileSystemDirectoryHandle = value;
    };

  return {
    bucket,
    deleteObject,
    getObjectBlob,
    getObjectText,
    headBucket,
    headObject,
    putObject,
    removeEmptyDirectories,
    reset,
    setFileSystemDirectoryHandle,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useIoStore, import.meta.hot));
