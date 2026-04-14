"use client"

import { useEffect, useState } from "react"
import { Users, Heart, ImageIcon, Eye, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { cn } from "@/lib/utils"

type PlatformMetrics = {
  followers: number
  likes: number
  posts: number
  views: number

  followersChange?: string
  likesChange?: string
  postsChange?: string
  viewsChange?: string

  followerHistory: { name: string; value: number }[]
  viewsHistory: { name: string; value: number }[]

  avgEngagement?: number
  bestPost?: {
    id: string
    score: number
  }

  bestDay?: string
  peakTime?: string
  topFormat?: string
}

const tabs = ["Instagram", "Twitter"] as const

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState<"Instagram" | "Twitter">("Twitter")

  const [twitterMetrics, setTwitterMetrics] = useState<any | null>(null)
  const [instagramMetrics, setInstagramMetrics] = useState<any | null>(null)

  const metrics =
    activeTab === "Twitter" ? twitterMetrics : instagramMetrics

  // ---------------- FETCHERS ----------------

  const fetchMetricsTwitter = async () => {
    try {
      const res = await fetch("/api/metrics/twitter")
      if (!res.ok) throw new Error("Failed to fetch Twitter metrics")

      const data: any = await res.json()
      console.log(data.avgEngagement)
      setTwitterMetrics(data)
    } catch (err) {
      console.error("Twitter fetch error:", err)
    }
  }

  const fetchMetricsInstagram = async () => {
    try {
      const res = await fetch("/api/metrics/instagram")
      if (!res.ok) throw new Error("Failed to fetch Instagram metrics")

      const data: any = await res.json()
      setInstagramMetrics(data)
    } catch (err) {
      console.error("Instagram fetch error:", err)
    }
  }

  // ---------------- EFFECT ----------------

  useEffect(() => {
    if (activeTab === "Twitter") fetchMetricsTwitter()
    if (activeTab === "Instagram") fetchMetricsInstagram()
  }, [activeTab])

  // ---------------- UI ----------------

  return (
    <div className="p-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-[16px] px-6 py-2.5 text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-[#A7D7A0] text-[#2E2E2E]"
                : "bg-card text-muted-foreground hover:bg-[#E8F5E9] hover:text-foreground border border-border"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Followers"
          value={metrics?.followers ?? "-"}
          change={metrics?.followersChange ?? ""}
          changeType="positive"
          icon={Users}
          iconBgColor="bg-[#A7D7A0]/30"
        />
        <StatCard
          title="Total Likes"
          value={metrics?.likes ?? "-"}
          change={metrics?.likesChange ?? ""}
          changeType="positive"
          icon={Heart}
          iconBgColor="bg-[#CFEFFF]/50"
        />
        <StatCard
          title="Posts"
          value={metrics?.posts ?? "-"}
          change={metrics?.postsChange ?? ""}
          changeType="positive"
          icon={ImageIcon}
          iconBgColor="bg-[#FFD54F]/30"
        />
        <StatCard
          title="Total Views"
          value={metrics?.views ?? "-"}
          change={metrics?.viewsChange ?? ""}
          changeType="positive"
          icon={Eye}
          iconBgColor="bg-[#E8F5E9]"
        />
      </section>

      {/* Charts */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Followers Over Time"
          subtitle={`${activeTab} follower growth`}
          data={metrics?.followerHistory ?? []}
          type="area"
        />
        <ChartCard
          title="Views Over Time"
          subtitle={`${activeTab} views`}
          data={metrics?.viewsHistory ?? []}
          type="area"
        />
      </section>

      {/* Growth Summary */}
      <section className="mt-8">
        <div className="rounded-[20px] bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-[16px] bg-[#A7D7A0]/30 p-3">
              <TrendingUp className="h-5 w-5 text-[#4CAF50]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Growth Summary
              </h3>
              <p className="text-sm text-muted-foreground">
                Your {activeTab} performance overview
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="rounded-[16px] bg-[#E8F5E9] p-4">
              <p className="text-sm text-muted-foreground">Best Day</p>
              <p className="text-xl font-semibold mt-1">
                {metrics?.bestDay ?? "-"}
              </p>
            </div>

            <div className="rounded-[16px] bg-[#CFEFFF]/50 p-4">
              <p className="text-sm text-muted-foreground">Peak Time</p>
              <p className="text-xl font-semibold mt-1">
                {metrics?.peakTime ?? "-"}
              </p>
            </div>

            <div className="rounded-[16px] bg-[#FFD54F]/20 p-4">
              <p className="text-sm text-muted-foreground">Avg Engagement</p>
              <p className="text-xl font-semibold mt-1">
                {metrics?.avgEngagement
                  ? `${metrics.avgEngagement}`
                  : "-"}
              </p>
            </div>

            <div className="rounded-[16px] bg-[#A7D7A0]/20 p-4">
              <p className="text-sm text-muted-foreground">Top Format</p>
              <p className="text-xl font-semibold mt-1">
                {metrics?.topFormat ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}