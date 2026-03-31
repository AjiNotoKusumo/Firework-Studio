"use client"

import { useEffect, useState } from "react"
import { Users, Heart, ImageIcon, Eye, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { cn } from "@/lib/utils"

const tabs = ["Instagram", "Twitter"]

const metricsData = {
  Instagram: {
    followers: "24,521",
    followersChange: "+8.2% from last month",
    likes: "156.2K",
    likesChange: "+12.5% from last week",
    posts: "342",
    postsChange: "+5 this week",
    views: "1.2M",
    viewsChange: "+18% from last month",
    followerHistory: [
      { name: "Jan", value: 18200 },
      { name: "Feb", value: 19500 },
      { name: "Mar", value: 20800 },
      { name: "Apr", value: 21900 },
      { name: "May", value: 23100 },
      { name: "Jun", value: 24521 },
    ],
    viewsHistory: [
      { name: "Jan", value: 820000 },
      { name: "Feb", value: 890000 },
      { name: "Mar", value: 950000 },
      { name: "Apr", value: 1020000 },
      { name: "May", value: 1100000 },
      { name: "Jun", value: 1200000 },
    ],
  },
  Twitter: {
    followers: "12,845",
    followersChange: "+5.8% from last month",
    likes: "89.4K",
    likesChange: "+9.2% from last week",
    posts: "892",
    postsChange: "+12 this week",
    views: "2.4M",
    viewsChange: "+24% from last month",
    followerHistory: [
      { name: "Jan", value: 9800 },
      { name: "Feb", value: 10200 },
      { name: "Mar", value: 10800 },
      { name: "Apr", value: 11400 },
      { name: "May", value: 12100 },
      { name: "Jun", value: 12845 },
    ],
    viewsHistory: [
      { name: "Jan", value: 1400000 },
      { name: "Feb", value: 1600000 },
      { name: "Mar", value: 1850000 },
      { name: "Apr", value: 2000000 },
      { name: "May", value: 2200000 },
      { name: "Jun", value: 2400000 },
    ],
  },
}

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState<"Instagram" | "Twitter">("Instagram")
  const [twitterMetrics, setTwitterMetrics] = useState<any>({})
  const data = metricsData[activeTab]

  const fetchMetricsTwitter = async () => {
    try{
      const response = await fetch("/api/metrics/twitter")

      if (!response.ok) {
        throw new Error("Failed to fetch Twitter metrics")
      }

      const twitterData = await response.json()

      console.log("Twitter Metrics Data:", twitterData.postData)

      setTwitterMetrics(twitterData)
    } catch(error) {
      console.log("Error fetching Twitter metrics:", error)
    }
  }

  useEffect(() => {
    if (activeTab === "Twitter") {
      fetchMetricsTwitter()
    }
  }, [activeTab])

  return (
    <div className="p-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "Instagram" | "Twitter")}
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
          value={activeTab === "Twitter" ? twitterMetrics.followers : data.followers}
          change={data.followersChange}
          changeType="positive"
          icon={Users}
          iconBgColor="bg-[#A7D7A0]/30"
        />
        <StatCard
          title="Total Likes"
          value={activeTab === "Twitter" ? twitterMetrics.like : data.likes}
          change={data.likesChange}
          changeType="positive"
          icon={Heart}
          iconBgColor="bg-[#CFEFFF]/50"
        />
        <StatCard
          title="Posts"
          value={activeTab === "Twitter" ? twitterMetrics.posts : data.posts}
          change={data.postsChange}
          changeType="positive"
          icon={ImageIcon}
          iconBgColor="bg-[#FFD54F]/30"
        />
        <StatCard
          title="Total Views"
          value={activeTab === "Twitter" ? twitterMetrics.views : data.views}
          change={data.viewsChange}
          changeType="positive"
          icon={Eye}
          iconBgColor="bg-[#E8F5E9]"
        />
      </section>

      {/* Charts */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Followers Over Time"
          subtitle={`${activeTab} follower growth over 6 months`}
          data={data.followerHistory}
          type="area"
        />
        <ChartCard
          title="Views Over Time"
          subtitle={`${activeTab} total views over 6 months`}
          data={data.viewsHistory}
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
              <h3 className="text-lg font-semibold text-foreground">Growth Summary</h3>
              <p className="text-sm text-muted-foreground">Your {activeTab} performance overview</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="rounded-[16px] bg-[#E8F5E9] p-4">
              <p className="text-sm text-muted-foreground">Best Day</p>
              <p className="text-xl font-semibold text-foreground mt-1">Saturday</p>
            </div>
            <div className="rounded-[16px] bg-[#CFEFFF]/50 p-4">
              <p className="text-sm text-muted-foreground">Peak Time</p>
              <p className="text-xl font-semibold text-foreground mt-1">6-8 PM</p>
            </div>
            <div className="rounded-[16px] bg-[#FFD54F]/20 p-4">
              <p className="text-sm text-muted-foreground">Avg. Engagement</p>
              <p className="text-xl font-semibold text-foreground mt-1">4.8%</p>
            </div>
            <div className="rounded-[16px] bg-[#A7D7A0]/20 p-4">
              <p className="text-sm text-muted-foreground">Top Format</p>
              <p className="text-xl font-semibold text-foreground mt-1">Carousels</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
