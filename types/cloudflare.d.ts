// Minimal shapes of the Cloudflare bindings this app uses (see wrangler.jsonc).

interface R2HttpMetadata {
  contentType?: string;
  cacheControl?: string;
}

interface R2ObjectInfo {
  key: string;
  size: number;
  uploaded: Date;
  httpMetadata?: R2HttpMetadata;
  customMetadata?: Record<string, string>;
}

interface R2ObjectBodyLike extends R2ObjectInfo {
  body: ReadableStream;
  httpEtag: string;
}

interface R2ListResult {
  objects: R2ObjectInfo[];
  truncated: boolean;
  cursor?: string;
}

interface AppCloudflareEnv {
  DB: unknown;
  MEDIA_BUCKET: {
    put(
      key: string,
      value: ArrayBuffer | ArrayBufferView | string | ReadableStream,
      options?: { httpMetadata?: R2HttpMetadata; customMetadata?: Record<string, string> }
    ): Promise<R2ObjectInfo | null>;
    get(key: string): Promise<R2ObjectBodyLike | null>;
    list(options?: {
      prefix?: string;
      cursor?: string;
      limit?: number;
      include?: ("httpMetadata" | "customMetadata")[];
    }): Promise<R2ListResult>;
    delete(key: string): Promise<void>;
  };
  ASSETS: unknown;
  R2_PUBLIC_URL?: string;
}
