import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
]);
const MAX_SIZE_BYTES = 15 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

/**
 * Handles reference image / logo uploads for the Custom Requirement Engine
 * (spec §"STEP 2 — UPLOAD REFERENCE IMAGE / DESIGN"). Files land in the
 * private `custom-uploads` bucket under the uploader's folder before the
 * custom_requests row even exists yet (draftId groups them for the final
 * submit), validated server-side for type/size — never trust the browser.
 */
export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid upload" }, { status: 400 });

  const file = formData.get("file");
  const purpose = formData.get("purpose");
  const draftId = formData.get("draftId");

  if (!(file instanceof File) || typeof purpose !== "string" || typeof draftId !== "string") {
    return NextResponse.json({ error: "Missing file, purpose or draftId" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WEBP, SVG or PDF." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 15MB)." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ownerFolder = user?.id ?? "guest";
  const path = `${ownerFolder}/${draftId}/${Date.now()}-${sanitizeFilename(file.name)}`;

  const admin = createAdminSupabaseClient();
  const { error } = await admin.storage.from("custom-uploads").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });

  return NextResponse.json({ path, name: file.name, purpose });
}
