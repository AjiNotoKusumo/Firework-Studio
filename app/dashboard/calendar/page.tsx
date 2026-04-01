"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { type Post } from "@/lib/posts-data"
import { Spinner } from "@/components/ui/spinner"
import Swal from "sweetalert2"

export default function CalendarPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts")
        if (response.ok) {
          const data = await response.json()
          // Filter to only scheduled and published posts with dates
          const postsWithDates = data.filter((p: Post) => p.scheduledAt || p.publishedDate)
          console.log("Fetched posts for calendar:", postsWithDates)
          setPosts(postsWithDates)
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error)
      } finally {
        setLoading(false)
      }
    }


  useEffect(() => {
    setMounted(true)

    fetchPosts()
  }, [])

  const handleEventDrop = async (info: any) => {
    try {
      const newDate = info.event.start.toLocaleDateString('en-CA');

      const post = posts.find(p => p.id === info.event.id);

      const { value: selectedTime } = await Swal.fire({
        title: 'Update Posting Time',
        icon: 'info',
        background: '#EDF5EB',
        html: `
          <div style="text-align: center;">
            <p>New Date: <b>${newDate}</b></p>
            <label for="swal-time" style="font-size: 12px; color: gray;">Pick Hour & Minute</label>
            <br/>
            <input type="time" id="swal-time" class="swal2-input" value="12:00">
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Reschedule',
        focusConfirm: false,
        preConfirm: () => {
          const timeInput = document.getElementById('swal-time') as HTMLInputElement;
  
          if (!timeInput || !timeInput.value) {
            Swal.showValidationMessage('Please select a time');
            return null;
          }
          
          return timeInput.value;
        }
      });

      if (selectedTime) {
        const finalDateTime = new Date(`${newDate}T${selectedTime}`);
        const scheduledAtUTC = finalDateTime.toISOString();

        const response = await fetch('/api/scheduler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: post?.id,
            caption: post?.caption,
            images: post?.media?.map((m: any) => m.url) || [],
            scheduledAt: scheduledAtUTC,
            postType: post?.postType,
            platform: post?.platform,
            userId: post?.userId,
            hashtags: post?.hashtags,
          }),
        });

        if (!response.ok) throw new Error('API failed');

        Swal.fire({
          title: 'Post Rescheduled',
          text: `New scheduled time: ${finalDateTime.toLocaleString()}`,
          icon: 'success',
          background: '#EDF5EB',
        });
        
        fetchPosts()
      } else {
        info.revert() // Revert the event position if time selection was cancelled or invalid
      }
    } catch (error) {
      console.error("Failed to update post date:", error)
      info.revert() // Revert the event position on error
    }
  
  };


  const calendarEvents = posts.map(post => ({
    id: post.id,
    title: post.caption.substring(0, 30) + (post.caption.length > 30 ? "..." : ""),
    date: post.scheduledAt || post.publishedDate,
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
