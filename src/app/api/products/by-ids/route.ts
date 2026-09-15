import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/data/catalog";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown) => typeof id === "string").slice(0, 12) : [];
  if (ids.length === 0) return NextResponse.json({ products: [] });

  const products = await getProductsByIds(ids);
  return NextResponse.json({ products });
}
