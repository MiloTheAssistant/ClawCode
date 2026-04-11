import { NextRequest, NextResponse } from "next/server";
import { queryCosts, queryRecentCostsByAgent } from "@/lib/sqlite";

export async function GET(request: NextRequest) {
  const period =
    (request.nextUrl.searchParams.get("period") as
      | "day"
      | "week"
      | "month") || "month";
  const view = request.nextUrl.searchParams.get("view");

  if (view === "by-agent") {
    return NextResponse.json(queryRecentCostsByAgent());
  }

  return NextResponse.json(queryCosts(period));
}
