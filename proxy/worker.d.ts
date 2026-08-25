// Types for the plain-JS Worker in `worker.js`.
//
// The Worker stays dependency-free JavaScript so `wrangler deploy` needs no
// build step, but tests/syncWorker.test.ts is TypeScript and `allowJs` is off
// across the project. This declaration is the seam: TS resolves the `.js`
// import here, Vite loads the real module at run time.

/** The subset of Cloudflare's KV binding the sync routes actually touch. */
export interface SyncKvNamespace {
  get(key: string): Promise<string | null>
  put(
    key: string,
    value: string,
    options?: { metadata?: { updatedAt?: number } },
  ): Promise<void>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string; cursor?: string }): Promise<{
    keys: Array<{ name: string; metadata?: { updatedAt?: number } }>
    list_complete: boolean
    cursor?: string
  }>
}

export interface WorkerEnv {
  SYNC?: SyncKvNamespace
}

/** Largest accepted `PUT /sync/:blobKey` body, in bytes. */
export declare const MAX_BLOB_BYTES: number

/** Every blob name the sync routes accept. Anything else is a 400. */
export declare const SYNC_BLOB_KEYS: string[]

/** Sync-code length, and how many of its leading characters form the syncId. */
export declare const TOKEN_LENGTH: number
export declare const SYNC_ID_LENGTH: number

export declare function handleRequest(request: Request, env?: WorkerEnv): Promise<Response>

declare const worker: {
  fetch(request: Request, env?: WorkerEnv): Promise<Response>
}
export default worker
