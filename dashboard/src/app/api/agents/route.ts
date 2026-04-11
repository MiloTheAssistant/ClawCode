import { NextResponse } from "next/server";
import { getAgentStatus } from "@/lib/gateway";

export async function GET() {
  return NextResponse.json(await getAgentStatus());
}
