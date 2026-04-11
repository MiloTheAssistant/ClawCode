"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Mail } from "lucide-react";

interface Channel {
  name: string;
  enabled: boolean;
  lastActivity: string | null;
  details: string;
}

const channelIcons: Record<string, typeof Send> = {
  Telegram: Send,
  Discord: MessageSquare,
  "Email (Gmail MCP)": Mail,
};

export function ChannelStatus({ channels }: { channels: Channel[] }) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Channels
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {channels.map((ch, i) => {
          const Icon = channelIcons[ch.name] || MessageSquare;
          return (
            <motion.div
              key={ch.name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.25 }}
              className="flex items-center gap-3"
            >
              <Icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <span className="text-xs text-zinc-300 w-28 shrink-0">
                {ch.name}
              </span>
              <Badge
                variant="secondary"
                className={`text-[10px] ${
                  ch.enabled
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-zinc-500/10 text-zinc-500"
                }`}
              >
                {ch.enabled ? "enabled" : "disabled"}
              </Badge>
              <span className="text-[10px] font-mono text-zinc-600 ml-auto">
                {ch.details}
              </span>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
