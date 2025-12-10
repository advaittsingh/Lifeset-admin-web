import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

const badgeVariants = {
  default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border-transparent bg-slate-200 text-slate-900 hover:bg-slate-300",
  destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
  outline: "text-slate-900 border-slate-300",
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", badgeVariants[variant], className)} {...props} />
  )
}

export { Badge, badgeVariants }

