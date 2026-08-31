import { readFile } from "fs/promises";
import path from "path";
import { createAdminClient } from "./admin";

/**
 * Content page storage helper.
 *
 * Admin-editable content pages (Contact, Shipping, FAQs, About Us, etc.)
 * are stored in the `content_pages` Supabase table so changes persist on
 * serverless deploys (Vercel's filesystem is read-only, so JSON-file
 * storage cannot be written to in production).
 *
 * The local `src/data/*.json` files act as the SEED/default content: they
 * are read when no Supabase row exists yet for a page. Once an admin saves
 * edits, the Supabase row takes over as the source of truth.
 */

const DATA_DIR = path.join(process.cwd(), "src", "data");

/** Read a content page from Supabase, falling back to the seed JSON file. */
export async function readContentPage(pageKey: string): Promise<any> {
  // 1. Prefer Supabase (source of truth after any admin edit).
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("content_pages")
      .select("content")
      .eq("page_key", pageKey)
      .maybeSingle();
    if (!error && data && data.content != null) {
      return data.content;
    }
  } catch (error) {
    // Table may not exist yet — fall through to seed file.
  }

  // 2. Fallback to the seed JSON file.
  return readSeedFile(pageKey);
}

/** Write a content page to Supabase. */
export async function writeContentPage(pageKey: string, content: unknown): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("content_pages")
    .upsert({ page_key: pageKey, content }, { onConflict: "page_key" });
  if (error) throw error;
}

/** Read the matching seed JSON file (e.g. `contact.json` for `contact`). */
export async function readSeedFile(pageKey: string): Promise<any> {
  try {
    const raw = await readFile(path.join(DATA_DIR, `${pageKey}.json`), "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read seed file for "${pageKey}":`, error);
    return null;
  }
}
