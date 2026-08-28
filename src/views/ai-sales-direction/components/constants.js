import {
  Target,
  AlertCircle,
  Minus,
  Lightbulb,
} from "lucide-react";

// Premium Brand Colors
export const BRAND_COLOR = "#887CFD";
export const BRAND_GRADIENT = "linear-gradient(135deg, #887CFD 0%, #6f63e3 100%)";

export const priorityConfig = {
  high: {
    icon: AlertCircle,
    color: "#EF4444",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    gradient: "from-red-500 via-rose-500 to-rose-600",
    glow: "shadow-red-500/20",
    badgeKey: "highPriority",
  },
  medium: {
    icon: Target,
    color: "#887CFD",
    bg: "bg-[#887CFD]/10",
    border: "border-[#887CFD]/20",
    gradient: "from-[#887CFD] via-[#7c6ff5] to-[#6f63e3]",
    glow: "shadow-[#887CFD]/20",
    badgeKey: "mediumPriority",
  },
  low: {
    icon: Minus,
    color: "#16C8C7",
    bg: "bg-[#16C8C7]/10",
    border: "border-[#16C8C7]/20",
    gradient: "from-[#16C8C7] via-[#12b5b4] to-[#0e8a89]",
    glow: "shadow-[#16C8C7]/20",
    badgeKey: "lowPriority",
  },
  info: {
    icon: Lightbulb,
    color: "#3B82F6",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    gradient: "from-blue-500 via-indigo-500 to-indigo-600",
    glow: "shadow-blue-500/20",
    badgeKey: "info",
  },
};
