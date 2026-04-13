import { NextResponse } from "next/server";
import { execFileSync } from "child_process";

export const dynamic = "force-dynamic";

function gatewayCall(method: string): unknown {
  try {
    const out = execFileSync(
      "openclaw",
      ["gateway", "call", method, "--json"],
      {
        timeout: 8_000,
        env: { ...process.env, NO_COLOR: "1" },
        stdio: ["ignore", "pipe", "ignore"],
      }
    ).toString();
    const start = Math.min(
      out.indexOf("{") >= 0 ? out.indexOf("{") : Infinity,
      out.indexOf("[") >= 0 ? out.indexOf("[") : Infinity
    );
    return JSON.parse(out.slice(start));
  } catch (err) {
    console.error("[api/costs] gateway call failed:", err);
    return null;
  }
}

export async function GET() {
  const data = gatewayCall("usage.cost");
  if (!data) {
    console.error("[api/costs] No data returned from gateway usage.cost");
  }
  return NextResponse.json(data ?? { daily: [], totals: {} });
}
