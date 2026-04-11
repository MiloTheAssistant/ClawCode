import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Bot,
  Brain,
  CircuitBoard,
  DollarSign,
  HardDrive,
  MessageSquare,
  ScrollText,
  Shield,
} from "lucide-react";

const panels = [
  {
    title: "Agent Roster",
    description: "16 agents — status, model, last invocation",
    icon: Bot,
    span: "col-span-2",
  },
  {
    title: "System Health",
    description: "Ollama, Gateway, Drive",
    icon: HardDrive,
    span: "",
  },
  {
    title: "Cost Tracker",
    description: "Per-agent token usage and cost",
    icon: DollarSign,
    span: "",
  },
  {
    title: "Workflow Monitor",
    description: "DFB, Signal Scanner, Content Engine",
    icon: CircuitBoard,
    span: "",
  },
  {
    title: "2Brain Stats",
    description: "Wiki articles, sources, knowledge gaps",
    icon: Brain,
    span: "",
  },
  {
    title: "Memory Ops",
    description: "Agent read/write/search transparency",
    icon: ScrollText,
    span: "",
  },
  {
    title: "Decision Log",
    description: "Recent decisions by Milo and Elon",
    icon: Shield,
    span: "",
  },
  {
    title: "Channel Status",
    description: "Discord, Telegram, Email",
    icon: MessageSquare,
    span: "",
  },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-indigo-500" />
          <h1 className="text-xl font-semibold font-[family-name:var(--font-geist-sans)]">
            Command Center
          </h1>
          <Badge variant="outline" className="ml-2 text-xs text-zinc-400">
            OpenClaw v2026.4
          </Badge>
        </div>
      </header>

      {/* Pipeline View (Hero) */}
      <section className="border-b border-zinc-800 px-6 py-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Pipeline View</CardTitle>
            <CardDescription>
              GOTCHA flow: Cortana → Specialists → Sentinel → Milo → Delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 overflow-x-auto py-4">
              {[
                "Cortana",
                "Pulse",
                "Sagan",
                "Quant",
                "Hemingway",
                "Sentinel",
                "Milo",
              ].map((agent) => (
                <div
                  key={agent}
                  className="flex flex-col items-center gap-2 min-w-[80px]"
                >
                  <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-mono text-zinc-400">
                    {agent[0]}
                  </div>
                  <span className="text-xs text-zinc-500">{agent}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Panel Grid */}
      <main className="flex-1 px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {panels.map((panel) => (
            <Card
              key={panel.title}
              className={`bg-zinc-900 border-zinc-800 ${panel.span}`}
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <panel.icon className="h-5 w-5 text-indigo-500" />
                <div>
                  <CardTitle className="text-base">{panel.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {panel.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-500 font-mono">
                  Awaiting live data...
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-3 text-xs text-zinc-600 font-mono">
        Command Center Dashboard — Kairo | OpenClaw GOTCHA Framework
      </footer>
    </div>
  );
}
