import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data/catalog";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ products: [] });

  const { products } = await getProducts({ search: q, pageSize: 6 });
  return NextResponse.json({ products });
}
