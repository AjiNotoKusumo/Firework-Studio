"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { usePathname, useRouter } from "next/navigation"


const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard/metrics": { 
    title: "Metrics", 
    subtitle: "Track your social media growth and performance" 
  },
  "/dashboard/trending": { 
    title: "Trending", 
    subtitle: "Discover viral content and trending posts" 
  },
  "/dashboard/saved": { 
    title: "Saved Posts", 
    subtitle: "Your collection of saved trending content" 
  },
  "/dashboard/planning": { 
    title: "Content Planning", 
    subtitle: "Create and manage your upcoming posts" 
  },
  "/dashboard/calendar": { 
    title: "Calendar", 
    subtitle: "Schedule and view your content timeline" 
  },
  "/dashboard/posts/create": { 
    title: "Create Post", 
    subtitle: "Create and schedule new content" 
  },
}

function getPageInfo(pathname: string): { title: string; subtitle: string } {
  // Check for exact matches first
  if (pageTitles[pathname]) {
    return pageTitles[pathname]
  }
  
  // Check for post view/edit pages
  if (pathname.match(/^\/dashboard\/posts\/[^/]+\/edit$/)) {
    return { title: "Edit Post", subtitle: "Modify your post details" }
  }
  
  if (pathname.match(/^\/dashboard\/posts\/[^/]+$/)) {
    return { title: "Post Details", subtitle: "View post information and metrics" }
  }
  
  return { title: "Dashboard", subtitle: "" }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()
  const pageInfo = getPageInfo(pathname)


  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-8 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{pageInfo.title}</h1>
            {pageInfo.subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{pageInfo.subtitle}</p>
            )}
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
