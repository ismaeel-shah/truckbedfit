interface AppCloudflareEnv {
  DB: unknown;
  MEDIA_BUCKET: {
    put(
      key: string,
      value: ArrayBuffer | ArrayBufferView | string | ReadableStream,
      options?: { httpMetadata?: { contentType?: string } }
    ): Promise<unknown>;
  };
  ASSETS: unknown;
  R2_PUBLIC_URL?: string;
}
