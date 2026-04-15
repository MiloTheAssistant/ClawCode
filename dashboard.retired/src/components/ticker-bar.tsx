import { getGatewayHealth } from "@/lib/gateway";
import { getOllamaStatus, getDiskSpace } from "@/lib/ollama";
import { getChannels } from "@/lib/workflows";

export default async function TickerBar() {
  const [gateway, ollama] = await Promise.all([
    getGatewayHealth().catch(() => ({ ok: false, status: "unreachable" })),
    getOllamaStatus().catch(() => ({ running: false, modelCount: 0, models: [] as string[] })),
  ]);

  let disk: { totalGB: number; usedGB: number; availGB: number; usedPercent: number } | null = null;
  try { disk = getDiskSpace(); } catch { /* no-op */ }

  let channels: { name: string; enabled: boolean; lastActivity: string | null; details: string }[] = [];
  try { channels = getChannels(); } catch { /* no-op */ }

  const telegram = channels.find((c) => c.name === "Telegram");
  const discord = channels.find((c) => c.name === "Discord");
  const email = channels.find((c) => c.name === "Email (Gmail MCP)");

  return (
    <div
      className="w-full bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-3 shrink-0 overflow-x-auto"
      style={{ height: "36px" }}
    >
      {/* Gateway */}
      <TickerItem
        label="GW"
        value={gateway.ok ? "live" : "down"}
        ok={gateway.ok}
      />

      <Pipe />

      {/* Ollama */}
      <TickerItem
        label="Ollama"
        value={ollama.running ? `${ollama.modelCount}m` : "off"}
        ok={ollama.running}
      />

      <Pipe />

      {/* Disk */}
      {disk ? (
        <>
          <TickerItem
            label="Disk"
            value={`${disk.usedPercent}% (${disk.availGB}GB free)`}
            ok={disk.usedPercent < 85}
          />
          <Pipe />
        </>
      ) : (
        <>
          <TickerItem label="Disk" value="n/a" ok={null} />
          <Pipe />
        </>
      )}

      {/* Telegram */}
      <TickerItem
        label="TG"
        value={telegram?.enabled ? "on" : "off"}
        ok={telegram?.enabled ?? false}
      />

      <Pipe />

      {/* Discord */}
      <TickerItem
        label="DC"
        value={discord?.enabled ? "on" : "off"}
        ok={discord?.enabled ?? false}
      />

      <Pipe />

      {/* Email/MCP */}
      <TickerItem
        label="Email"
        value={email?.enabled ? "mcp" : "off"}
        ok={email?.enabled ?? false}
      />

      {/* Spacer + Version */}
      <div className="ml-auto shrink-0">
        <span className="text-[10px] font-mono text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
          v2026.4
        </span>
      </div>
    </div>
  );
}

function Pipe() {
  return <span className="text-slate-300 font-mono text-xs select-none">|</span>;
}

function TickerItem({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean | null;
}) {
  const dotColor =
    ok === null
      ? "bg-slate-300"
      : ok
        ? "bg-emerald-500"
        : "bg-rose-500";

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-[10px] font-mono text-slate-700 font-medium">
        {value}
      </span>
    </div>
  );
}
