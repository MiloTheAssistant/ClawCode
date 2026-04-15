import { NextResponse } from "next/server";
import { getGatewayHealth } from "@/lib/gateway";
import { getOllamaStatus, getRunningModels } from "@/lib/ollama";

export async function GET() {
  const [gateway, ollama, running] = await Promise.all([
    getGatewayHealth(),
    getOllamaStatus(),
    getRunningModels(),
  ]);

  return NextResponse.json({
    gateway,
    ollama: { ...ollama, running: running.models ?? [] },
  });
}
