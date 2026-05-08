import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: any
  value: any
  change: any
  changeType: "positive" | "negative" | "neutral"
  icon: LucideIcon
  iconBgColor?: string
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon,
  iconBgColor = "bg-[#E8F5E9]"
}: StatCardProps) {
  return (
    <div className="rounded-[20px] bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
          <p className={cn(
            "mt-2 text-sm font-medium",
            changeType === "positive" && "text-[#4CAF50]",
            changeType === "negative" && "text-[#ef4444]",
            changeType === "neutral" && "text-muted-foreground"
          )}>
            {change}
          </p>
        </div>
        <div className={cn("rounded-[16px] p-3", iconBgColor)}>
          <Icon className="h-6 w-6 text-[#2E2E2E]" />
        </div>
      </div>
    </div>
  )
}
