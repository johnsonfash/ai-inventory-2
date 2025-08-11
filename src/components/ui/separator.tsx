import { cn } from "@/lib/utils"

export function Separator({
  orientation = "horizontal",
  className,
}: { orientation?: "horizontal" | "vertical"; className?: string }) {
  return <div className={cn("bg-border", orientation === "horizontal" ? "h-px w-full" : "h-4 w-px", className)} />
}
