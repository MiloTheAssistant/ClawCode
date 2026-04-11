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
  // Parse from workflows.yaml — for now return known workflows
  // Real YAML parsing would need js-yaml dependency
  return [
    {
      name: "Daily Financial Briefing",
      schedule: "8:45 AM CT, weekdays",
      status: "active",
      lastRun: getLastBriefingDate(),
    },
    {
      name: "Market Signal Scanner",
      schedule: "Every 4 hours",
      status: "active",
      lastRun: null,
    },
    {
      name: "Content Repurposing Engine",
      schedule: "Manual trigger",
      status: "pending_approval",
      lastRun: null,
    },
  ];
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
        details: channels.telegram?.streaming || "off",
      },
      {
        name: "Discord",
        enabled: channels.discord?.enabled ?? false,
        lastActivity: null,
        details: channels.discord?.streaming || "off",
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
