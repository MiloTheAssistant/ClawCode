"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Bot,
  DollarSign,
  Brain,
  ClipboardList,
  BookOpen,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Bot, label: "Agents", href: "/agents" },
  { icon: DollarSign, label: "Costs", href: "/costs" },
  { icon: Brain, label: "Memory", href: "/memory" },
  { icon: ClipboardList, label: "Decisions", href: "/decisions" },
  { icon: BookOpen, label: "2Brain", href: "/brain" },
  { icon: Settings, label: "Workflows", href: "/workflows" },
];

export default function LeftNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-col items-center py-2 bg-white border-r border-slate-200 shrink-0"
      style={{ width: "52px" }}
    >
      {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={[
              "flex items-center justify-center rounded-lg transition-colors mb-1",
              "h-9 w-9",
              isActive
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
