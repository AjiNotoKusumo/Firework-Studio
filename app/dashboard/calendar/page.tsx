"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { type Post } from "@/lib/posts-data"
import { Spinner } from "@/components/ui/spinner"

export default function CalendarPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts")
        if (response.ok) {
          const data = await response.json()
          // Filter to only scheduled and published posts with dates
          const postsWithDates = data.filter((p: Post) => p.scheduledDate || p.publishedDate)
          setPosts(postsWithDates)
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleEventDrop = (info: any) => {
  // Update event in your state or send to API
      console.log(info.event.title + " was dropped on " + info.event.start.toISOString());
      if (!window.confirm("Change post schedule to " + info.event.start + "?")) {
          info.revert(); // Revert the event to its original position
      }
  };


  const calendarEvents = posts.map(post => ({
    id: post.id,
    title: post.caption.substring(0, 30) + (post.caption.length > 30 ? "..." : ""),
    date: post.scheduledDate || post.publishedDate,
    backgroundColor: post.status === "published" 
      ? "#A7D7A0" 
      : post.platform === "instagram" 
        ? "#E1306C" 
        : "#CFEFFF",
    borderColor: post.status === "published" 
      ? "#A7D7A0" 
      : post.platform === "instagram" 
        ? "#E1306C" 
        : "#CFEFFF",
    textColor: post.status === "published" || post.platform === "twitter" ? "#2E2E2E" : "#ffffff"
  }))

  const handleEventClick = (info: { event: { id: string } }) => {
    router.push(`/dashboard/posts/${info.event.id}`)
  }

  if (!mounted || loading) {
    return (
      <div className="p-8">
        <div className="rounded-[20px] bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <div className="h-[600px] flex items-center justify-center">
            <Spinner className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Calendar */}
      <div className="rounded-[20px] bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <style jsx global>{`
          .fc {
            --fc-border-color: #d1e7d0;
            --fc-button-bg-color: #A7D7A0;
            --fc-button-border-color: #A7D7A0;
            --fc-button-text-color: #2E2E2E;
            --fc-button-hover-bg-color: #8BC98B;
            --fc-button-hover-border-color: #8BC98B;
            --fc-button-active-bg-color: #7BB97B;
            --fc-button-active-border-color: #7BB97B;
            --fc-today-bg-color: #E8F5E9;
            font-family: inherit;
          }
          .fc .fc-button {
            border-radius: 12px;
            padding: 8px 16px;
            font-weight: 500;
          }
          .fc .fc-toolbar-title {
            font-size: 1.25rem;
            font-weight: 600;
          }
          .fc .fc-daygrid-day {
            border-radius: 8px;
          }
          .fc .fc-daygrid-day-number {
            padding: 8px;
          }
          .fc .fc-event {
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 0.75rem;
            cursor: pointer;
          }
          .fc .fc-daygrid-event-harness {
            margin: 2px 4px;
          }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          editable={true}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth"
          }}
          height={600}
        />
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-[#A7D7A0]" />
          <span className="text-sm text-muted-foreground">Published</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-[#E1306C]" />
          <span className="text-sm text-muted-foreground">Instagram Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-[#CFEFFF]" />
          <span className="text-sm text-muted-foreground">Twitter Scheduled</span>
        </div>
      </div>
    </div>
  )
}
