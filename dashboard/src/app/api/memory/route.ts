import { NextRequest, NextResponse } from "next/server";
import { queryMemoryOps } from "@/lib/sqlite";

export async function GET(request: NextRequest) {
  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") || "50",
    10
  );
  return NextResponse.json(queryMemoryOps(limit));
}
