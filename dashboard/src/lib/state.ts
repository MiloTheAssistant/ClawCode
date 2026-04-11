import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { config } from "./config";

export interface DecisionEntry {
  id: string;
  date: string;
  decision: string;
  made_by: string;
  context: string;
}

export interface ProjectEntry {
  project: string;
  status: string;
  owner: string;
  last_updated: string;
  notes: string;
}


function parseMarkdownTable(content: string): Record<string, string>[] {
  const lines = content.split("\n").filter((l) => l.startsWith("|"));
  if (lines.length < 3) return [];
  const headers = lines[0]
    .split("|")
    .map((h) => h.trim())
    .filter(Boolean);
  return lines.slice(2).map((line) => {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.toLowerCase().replace(/\s+/g, "_")] = cells[i] || "";
    });
    return row;
  });
}

export function getDecisionLog(): DecisionEntry[] {
  try {
    const content = readFileSync(
      join(config.openclawMaster.root, "state/Decision_Log.md"),
      "utf-8"
    );
    return parseMarkdownTable(content) as unknown as DecisionEntry[];
  } catch {
    return [];
  }
}

export function getActiveProjects(): ProjectEntry[] {
  try {
    const content = readFileSync(
      join(config.openclawMaster.root, "state/Active_Projects.md"),
      "utf-8"
    );
    return parseMarkdownTable(content) as unknown as ProjectEntry[];
  } catch {
    return [];
  }
}

export function getBrainStats() {
  try {
    const wikiDir = join(config.twobrain.root, "wiki");
    const rawDir = join(config.twobrain.root, "raw");
    const briefingsDir = join(config.twobrain.root, "briefings/archive");

    const countFiles = (dir: string, ext?: string) => {
      try {
        const files = readdirSync(dir).filter(
          (f) => !f.startsWith(".") && !f.startsWith("_")
        );
        return ext ? files.filter((f) => f.endsWith(ext)).length : files.length;
      } catch {
        return 0;
      }
    };

    const getLatestMod = (dir: string) => {
      try {
        const files = readdirSync(dir);
        let latest = 0;
        for (const f of files) {
          const s = statSync(join(dir, f));
          if (s.mtimeMs > latest) latest = s.mtimeMs;
        }
        return latest ? new Date(latest).toISOString() : null;
      } catch {
        return null;
      }
    };

    return {
      wikiArticles: countFiles(wikiDir, ".md"),
      rawSources: countFiles(rawDir),
      briefings: countFiles(briefingsDir, ".json"),
      lastWikiUpdate: getLatestMod(wikiDir),
      lastBriefing: getLatestMod(briefingsDir),
    };
  } catch {
    return {
      wikiArticles: 0,
      rawSources: 0,
      briefings: 0,
      lastWikiUpdate: null,
      lastBriefing: null,
    };
  }
}
