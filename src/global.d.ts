import type {
  DeleteObjectCommandInput,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  HeadObjectCommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import type { Dialog } from "electron";

declare global {
  interface Window {
    deleteObject: ({ Bucket, Key }: DeleteObjectCommandInput) => Promise<void>;
    dialog: Dialog;
    focusedWindowClose: () => void;
    focusedWindowIsMaximized: () => boolean | undefined;
    focusedWindowMinimize: () => void;
    focusedWindowToggleMaximize: () => void;
    getObject: ({
      Bucket,
      Key,
    }: GetObjectCommandInput) => Promise<GetObjectCommandOutput>;
    headObject: ({ Bucket, Key }: HeadObjectCommandInput) => Promise<undefined>;
    MonacoEnvironment: Environment;
    putObject: ({ Body, Bucket, Key }: PutObjectCommandInput) => Promise<void>;
    removeEmptyDirectories: (
      directory: string,
      exclude?: string[],
    ) => Promise<void>;
  }
}
