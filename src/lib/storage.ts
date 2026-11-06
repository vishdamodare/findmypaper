import "server-only";
import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Supabase Storage when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set;
 * otherwise local disk (.storage/) so the app works out of the box in development.
 * Files are never publicly addressable: they are always served through our API routes.
 */
const bucket = process.env.SUPABASE_BUCKET || "resources";
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null;

export const storageBackend = supabase ? "supabase" : "local";
const localPath = (key: string) => path.join(process.cwd(), ".storage", path.basename(key));

export async function putFile(key: string, data: Buffer, contentType: string) {
  if (supabase) {
    const { error } = await supabase.storage.from(bucket).upload(key, data, { contentType });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);
    return;
  }
  await mkdir(path.dirname(localPath(key)), { recursive: true });
  await writeFile(localPath(key), data);
}

export async function getFile(key: string): Promise<Buffer | null> {
  if (supabase) {
    const { data, error } = await supabase.storage.from(bucket).download(key);
    return error || !data ? null : Buffer.from(await data.arrayBuffer());
  }
  return readFile(localPath(key)).catch(() => null);
}

export async function deleteFile(key: string) {
  if (supabase) await supabase.storage.from(bucket).remove([key]);
  else await unlink(localPath(key)).catch(() => {});
}

/**
 * Short-lived direct URL (Supabase CDN, supports range requests) so file bytes bypass our server.
 * Returns null for local-disk storage, where the caller must stream the file itself.
 */
export async function signedUrl(key: string, opts: { downloadAs?: string; expiresIn?: number } = {}): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(key, opts.expiresIn ?? 300, opts.downloadAs ? { download: opts.downloadAs } : undefined);
  if (error || !data) throw new Error(`Could not sign URL: ${error?.message}`);
  return data.signedUrl;
}
