import type {
  DeleteObjectCommandInput,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  HeadObjectCommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

declare global {
  interface Window {
    deleteObject: ({ Bucket, Key }: DeleteObjectCommandInput) => Promise<void>;
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
    showOpenDialog: (
      options: Electron.OpenDialogOptions,
    ) => Promise<Electron.OpenDialogReturnValue>;
  }
}
