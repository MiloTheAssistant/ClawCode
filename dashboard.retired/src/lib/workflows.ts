import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { config } from "./config";

export interface WorkflowEntry {
  name: string;
  schedule: string;
  status: string;
  lastRun: string | null;
}

export function getWorkflows(): WorkflowEntry[] {
  try {
    const raw = readFileSync(
      join(config.openclawMaster.root, "state/workflows.json"),
      "utf-8"
    );
    const data = JSON.parse(raw);
    const workflows: WorkflowEntry[] = (data.workflows ?? []).map(
      (w: { name: string; schedule: string; status: string }) => ({
        name: w.name,
        schedule: w.schedule,
        status: w.status,
        lastRun:
          w.name === "Daily Financial Briefing"
            ? getLastBriefingDate()
            : null,
      })
    );
    return workflows;
  } catch {
    // Fallback if state file missing
    return [
      {
        name: "Daily Financial Briefing",
        schedule: "8:45 AM CT, weekdays",
        status: "active",
        lastRun: getLastBriefingDate(),
      },
    ];
  }
}

function getLastBriefingDate(): string | null {
  try {
    const dir = join(config.twobrain.root, "briefings/archive");
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".json") && f !== "latest.json")
      .sort()
      .reverse();
    return files[0]?.replace(".json", "") ?? null;
  } catch {
    return null;
  }
}

export interface ChannelStatus {
  name: string;
  enabled: boolean;
  lastActivity: string | null;
  details: string;
}

export function getChannels(): ChannelStatus[] {
  try {
    const raw = readFileSync(
      join(config.openclawMaster.root, "openclaw.json"),
      "utf-8"
    );
    const data = JSON.parse(raw);
    const channels = data.channels || {};

    return [
      {
        name: "Telegram",
        enabled: channels.telegram?.enabled ?? false,
        lastActivity: null,
        details: typeof channels.telegram?.streaming === "string"
          ? channels.telegram.streaming
          : channels.telegram?.streaming?.mode || "off",
      },
      {
        name: "Discord",
        enabled: channels.discord?.enabled ?? false,
        lastActivity: null,
        details: typeof channels.discord?.streaming === "string"
          ? channels.discord.streaming
          : channels.discord?.streaming?.mode || "off",
      },
      {
        name: "Email (Gmail MCP)",
        enabled: !!data.mcp?.servers?.["gmail-jds"],
        lastActivity: null,
        details: "MCP server",
      },
    ];
  } catch {
    return [];
  }
}
