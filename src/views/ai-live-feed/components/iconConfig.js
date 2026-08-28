/**
 * Icon and background style configuration for AI Live Feed timeline items.
 * Maps event types to Lucide icons and Tailwind gradient classes.
 * Used by TimelineItem to render type-specific icons and gradients.
 */
import {
  Slack,
  Github,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Package,
  UserPlus,
  User,
  Mail,
  Calendar,
  AlertTriangle,
  Bell,
  Lightbulb,
  Zap,
  Shield,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const ICON_MAP = {
  slack: Slack,
  slack_reaction: Slack,
  github_commit: Github,
  github_pr: Github,
  sales: TrendingUp,
  revenue: TrendingUp,
  order: ShoppingCart,
  purchase: ShoppingCart,
  payment: CreditCard,
  refund: DollarSign,
  product: Package,
  customer: UserPlus,
  user_signup: UserPlus,
  user_update: User,
  email: Mail,
  meeting: Calendar,
  calendar: Calendar,
  alert: AlertTriangle,
  warning: AlertTriangle,
  notification: Bell,
  insight: Lightbulb,
  action: Zap,
  security: Shield,
  file: FileText,
  document: FileText,
  success: CheckCircle2,
  completed: CheckCircle2,
};

const BG_MAP = {
  slack: "bg-gradient-to-br from-[#4A154B] to-[#611f69] text-white",
  slack_reaction: "bg-gradient-to-br from-[#4A154B] to-[#611f69] text-white",
  github_commit: "bg-gradient-to-br from-[#24292F] to-[#424a53] text-white",
  github_pr: "bg-gradient-to-br from-[#24292F] to-[#424a53] text-white",
  sales: "bg-gradient-to-br from-[#16C8C7] to-[#0e8a89] text-white",
  revenue: "bg-gradient-to-br from-[#16C8C7] to-[#0e8a89] text-white",
  success: "bg-gradient-to-br from-[#16C8C7] to-[#0e8a89] text-white",
  completed: "bg-gradient-to-br from-[#16C8C7] to-[#0e8a89] text-white",
  insight: "bg-gradient-to-br from-[#887CFD] to-[#6f63e3] text-white",
  product: "bg-gradient-to-br from-[#887CFD] to-[#6f63e3] text-white",
  meeting: "bg-gradient-to-br from-[#887CFD] to-[#6f63e3] text-white",
  calendar: "bg-gradient-to-br from-[#887CFD] to-[#6f63e3] text-white",
  email: "bg-gradient-to-br from-[#887CFD] to-[#6f63e3] text-white",
  action: "bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white",
  alert: "bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white",
  warning: "bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white",
  refund: "bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white",
  customer: "bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white",
  user_signup: "bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white",
  user_update: "bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white",
  file: "bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white",
  document: "bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white",
  security: "bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white",
  error: "bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white",
  order: "bg-gradient-to-br from-[#EC4899] to-[#DB2777] text-white",
  purchase: "bg-gradient-to-br from-[#EC4899] to-[#DB2777] text-white",
  payment: "bg-gradient-to-br from-[#EC4899] to-[#DB2777] text-white",
};

const DEFAULT_ICON = Sparkles;
const DEFAULT_BG =
  "bg-gradient-to-br from-[#887CFD] to-[#16C8C7] text-white";

/**
 * Returns the Lucide icon component for the given event type.
 * Falls back to Sparkles for unknown types.
 */
export function getIconForType(type) {
  const Icon = ICON_MAP[type] ?? DEFAULT_ICON;
  return Icon;
}

/**
 * Returns the Tailwind gradient class string for the given event type.
 * Falls back to default purple-to-teal gradient for unknown types.
 */
export function getBgForType(type) {
  return BG_MAP[type] ?? DEFAULT_BG;
}
