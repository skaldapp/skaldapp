import type { GetObjectCommandInput } from "@aws-sdk/client-s3";
import type {
  StreamingBlobPayloadInputTypes,
  StreamingBlobPayloadOutputTypes,
} from "@smithy/types";

import { S3 } from "@aws-sdk/client-s3";
import * as fsa from "@skaldapp/fsa";
import { FetchHttpHandler } from "@smithy/fetch-http-handler";
import { AES, Utf8 } from "crypto-es";
import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import { useMainStore } from "stores/main";
import { ref } from "vue";

export const useIoStore = defineStore("io", () => {
  let fileSystemDirectoryHandle: FileSystemDirectoryHandle | undefined,
    s3: S3 | undefined;

  const requestHandler = new FetchHttpHandler(),
    setS3 = (value?: S3) => {
      s3?.destroy();
      s3 = value;
    },
    { credential } = storeToRefs(useMainStore());

  const bucket = ref(""),
    deleteObject = async (Key: string) => {
      if (bucket.value)
        if (fileSystemDirectoryHandle)
          await fsa.deleteObject(fileSystemDirectoryHandle, Key);
        else await (s3 ?? window).deleteObject({ Bucket: bucket.value, Key });
    },
    getObject = async ({
      Bucket,
      Key,
      ResponseCacheControl,
    }: GetObjectCommandInput) => {
      if (Bucket !== undefined && Key !== undefined) {
        let Body: StreamingBlobPayloadOutputTypes | undefined,
          ContentType: string | undefined;
        if (fileSystemDirectoryHandle)
          ({ Body, ContentType } = await fsa.getObject(
            fileSystemDirectoryHandle,
            Key,
          ));
        else
          try {
            ({ Body, ContentType } = await (s3 ?? window).getObject({
              Bucket,
              Key,
              ResponseCacheControl,
            }));
          } catch {
            return new Response();
          }
        const headers = new Headers({
          "content-type": ContentType ?? "application/octet-stream",
        });
        return new Response(Body as BodyInit, { headers });
      } else return new Response();
    },
    getObjectBlob = async (Key: string, ResponseCacheControl?: string) =>
      (
        await getObject({ Bucket: bucket.value, Key, ResponseCacheControl })
      ).blob(),
    getObjectText = async (Key: string, ResponseCacheControl?: string) =>
      (
        await getObject({ Bucket: bucket.value, Key, ResponseCacheControl })
      ).text(),
    headBucket = async (Bucket: string, pin: string | undefined) => {
      let {
        accessKeyId = null,
        endpoint = null,
        region = null,
        secretAccessKey = null,
      } = credential.value[Bucket] ?? {};
      if (pin) {
        accessKeyId = AES.decrypt(accessKeyId ?? "", pin).toString(Utf8);
        endpoint = AES.decrypt(endpoint ?? "", pin).toString(Utf8);
        region = AES.decrypt(region ?? "", pin).toString(Utf8);
        secretAccessKey = AES.decrypt(secretAccessKey ?? "", pin).toString(
          Utf8,
        );
      }
      setS3(
        accessKeyId && secretAccessKey && endpoint && region
          ? new S3({
              credentials: { accessKeyId, secretAccessKey },
              endpoint,
              region,
              requestHandler,
            })
          : undefined,
      );
      try {
        await s3?.headBucket({ Bucket });
      } catch (err) {
        setS3();
        throw new Error(err as string, { cause: err });
      }
    },
    headObject = async (Key: string, ResponseCacheControl?: string) => {
      if (fileSystemDirectoryHandle)
        return fsa.headObject(fileSystemDirectoryHandle, Key);
      return (s3 ?? window).headObject({
        Bucket: bucket.value,
        Key,
        ResponseCacheControl,
      });
    },
    putObject = async (
      Key: string,
      body: StreamingBlobPayloadInputTypes,
      ContentType: string,
    ) => {
      const Body =
        typeof body === "string" ? new TextEncoder().encode(body) : body;
      if (fileSystemDirectoryHandle)
        await fsa.putObject(fileSystemDirectoryHandle, Key, Body);
      else
        await (s3 ?? window).putObject({
          Body,
          Bucket: bucket.value,
          ContentType,
          Key,
        });
    },
    removeEmptyDirectories = async () => {
      const exclude = ["node_modules", ".git"];
      if (bucket.value)
        if (fileSystemDirectoryHandle)
          await fsa.removeEmptyDirectories(fileSystemDirectoryHandle, exclude);
        else if (!s3)
          await window.removeEmptyDirectories(bucket.value, exclude);
    },
    reset = () => {
      bucket.value = "";
      setS3();
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
