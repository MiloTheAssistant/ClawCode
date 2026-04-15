import { execFileSync } from "child_process";
import { config } from "./config";

export async function getOllamaStatus() {
  try {
    const res = await fetch(`${config.ollama.url}/api/tags`, {
      next: { revalidate: 30 },
    });
    const data = await res.json();
    return {
      running: true,
      modelCount: data.models?.length ?? 0,
      models: (data.models ?? []).map(
        (m: { name: string; size: number; modified_at: string }) => ({
          name: m.name,
          size: m.size,
          modified: m.modified_at,
        })
      ),
    };
  } catch {
    return { running: false, modelCount: 0, models: [] };
  }
}

export async function getRunningModels() {
  try {
    const res = await fetch(`${config.ollama.url}/api/ps`, {
      next: { revalidate: 10 },
    });
    const data = await res.json();
    return data.models ?? [];
  } catch {
    return [];
  }
}

export function getDiskSpace() {
  try {
    const output = execFileSync("df", ["-k", config.disk.volume]).toString();
    const lines = output.trim().split("\n");
    if (lines.length < 2) return null;
    const parts = lines[1].split(/\s+/);
    const totalKB = parseInt(parts[1], 10);
    const usedKB = parseInt(parts[2], 10);
    const availKB = parseInt(parts[3], 10);
    return {
      totalGB: +(totalKB / 1048576).toFixed(1),
      usedGB: +(usedKB / 1048576).toFixed(1),
      availGB: +(availKB / 1048576).toFixed(1),
      usedPercent: +((usedKB / totalKB) * 100).toFixed(1),
    };
  } catch {
    return null;
  }
}
