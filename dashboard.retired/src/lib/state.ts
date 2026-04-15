import { readFileSync, readdirSync, statSync, existsSync } from "fs";
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

// ── Wiki ─────────────────────────────────────────────────────────────────────

export interface WikiArticle {
  slug: string;
  title: string;
  summary: string;
  lastModified: string;
}

export function getWikiArticles(): WikiArticle[] {
  const wikiDir = join(config.twobrain.root, "wiki");
  try {
    const files = readdirSync(wikiDir).filter(
      (f) =>
        f.endsWith(".md") &&
        f !== "INDEX.md" &&
        f !== "log.md" &&
        !f.startsWith("_")
    );
    return files
      .map((f) => {
        const fullPath = join(wikiDir, f);
        const content = readFileSync(fullPath, "utf-8");
        const slug = f.replace(/\.md$/, "");
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const summaryMatch = content.match(/\*\*Summary\*\*:\s*(.+)$/m);
        const stat = statSync(fullPath);
        return {
          slug,
          title: titleMatch ? titleMatch[1] : slug,
          summary: summaryMatch ? summaryMatch[1].trim() : "",
          lastModified: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
  } catch {
    return [];
  }
}

export function getWikiArticleContent(slug: string): string | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const filePath = join(config.twobrain.root, "wiki", `${slug}.md`);
    if (!existsSync(filePath)) return null;
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

// ── Briefings ─────────────────────────────────────────────────────────────────

export interface BriefingSummary {
  date: string;
  weekday: string;
  edition: string;
  theme: string | null;
  confidence: string;
  sourcesCount: number;
  sectionNames: string[];
}

export function getBriefings(): BriefingSummary[] {
  const briefingsDir = join(config.twobrain.root, "briefings/archive");
  try {
    const files = readdirSync(briefingsDir).filter(
      (f) => f.endsWith(".json") && f !== "latest.json"
    );
    return files
      .map((f) => {
        const data = JSON.parse(
          readFileSync(join(briefingsDir, f), "utf-8")
        );
        return {
          date: data.date as string,
          weekday: data.weekday as string,
          edition: (data.edition as string) || "standard",
          theme: (data.theme as string) || null,
          confidence: (data.confidence as string) || "unknown",
          sourcesCount: (data.sourcesCount as number) || 0,
          sectionNames: Object.keys(
            (data.sections as Record<string, unknown>) || {}
          ),
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export function getBriefingByDate(
  date: string
): Record<string, unknown> | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  try {
    const filePath = join(
      config.twobrain.root,
      "briefings/archive",
      `${date}.json`
    );
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

// ── Brain Stats ───────────────────────────────────────────────────────────────

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
