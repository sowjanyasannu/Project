import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const productId = formData?.get("productId");
  if (!(file instanceof File) || typeof productId !== "string") {
    return NextResponse.json({ error: "Missing file or productId" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 10MB)." }, { status: 400 });
  }

  const supabaseAdmin = createAdminSupabaseClient();
  const path = `${productId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const { error } = await supabaseAdmin.storage.from("product-images").upload(path, file, {
    contentType: file.type,
  });
  if (error) return NextResponse.json({ error: "Upload failed." }, { status: 500 });

  const { data: publicUrl } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ url: publicUrl.publicUrl });
}
