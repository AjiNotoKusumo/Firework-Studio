"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { SiInstagram, SiTiktok, SiX } from "react-icons/si";
import { 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Users, 
  TrendingUp,
  Instagram,
  Twitter,
  Calendar,
  Edit3,
  Trash2
} from "lucide-react"
import { type Post } from "@/lib/posts-data"
import { Spinner } from "@/components/ui/spinner"
import { useSession } from "@/lib/auth-client"
import Swal from "sweetalert2"

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

export default function ViewPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const { data: session, isPending } = useSession();
  const [metrics, setMetrics] = useState<any>(null)
  const [isPublished, setIsPublished] = useState(false)
  
  const fetchTwitterMetrics = async (metricsId: string) => {
    try {
      const response = await fetch(`/api/metrics/twitter/${metricsId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch Twitter metrics data")
      }

      const data = await response.json()
      console.log("Fetched metrics data twitter:", data)

      setMetrics(data)

    } catch (error) {
      console.error("Failed to fetch Twitter metrics data:", error)
    }
  }
  
  const fetchInstagramMetrics = async (metricsId: string) => {
    try {
      const response = await fetch(`/api/metrics/instagram/${metricsId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch metrics")
      }

      const data = await response.json()
      console.log("Fetched metrics data instagram:", data.likes)

      setMetrics(data)

    } catch (error) {
      console.error("Failed to fetch Instagram metrics data:", error)
    }
  }

  const fetchTikTokMetrics = async (metricsId: string) => {
    try {

      setMetrics({
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        reach: 0,
        engagement: 0
      })

    } catch (error) {
      console.error("Failed to fetch TikTok metrics data:", error)
    }
  }  

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`)
      if (!response.ok) {
        throw new Error("Post not found")
      }
      const data = await response.json()
      setPost(data)

      if (data.status === "published") {
        setIsPublished(true)
        if(data.platform === "instagram") {
          fetchInstagramMetrics(data.instagramId)
        } else if(data.platform === "twitter") {
          fetchTwitterMetrics(data.twitterId)
        } else if(data.platform === "tiktok") {
          fetchTikTokMetrics(data.tiktokId)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const conirmation = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        background: '#e5ecdf', 
        color: '#727070' 
      })

      if(!conirmation.isConfirmed) {
        return Swal.fire({ 
          title: 'Cancelled', 
          text: 'Your post is saved', 
          icon: 'error', 
          background: '#e5ecdf', 
          color: '#727070' 
        });
      }

      const response = await fetch(`/api/posts/${params.id}`, { method: 'DELETE' });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      
      router.push('/dashboard/planning');
      router.refresh();
    } catch (error) {
      const message = (error as Error).message
      const redirect = await Swal.fire({ 
          title: 'Failed', 
          text: message || 'Failed to delete post', 
          icon: 'error', 
          background: '#e5ecdf', 
          color: '#727070'  
      });
    } finally {
      setIsDeleting(false);
    }
    
  }

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Post not found</h2>
          <p className="text-muted-foreground">{error}</p>
          <Link 
            href="/dashboard/planning"
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Planning
          </Link>
        </div>
      </div>
    )
  }

  

  return (
    <div className="p-6 lg:p-8">
      {/* Back Button */}
      <Link 
        href="/dashboard/planning"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Planning
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div>
          <div className="rounded-[20px] bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            {/* Main Image */}
            <div className="relative aspect-square rounded-[16px] overflow-hidden bg-secondary mb-4">
              <Image
                src={post.media?.[selectedImageIndex]?.url || "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg"}
                alt={post.caption}
                fill
                className="object-cover"
              />
              
              {/* Status Badge */}
              <div className={`absolute top-4 left-4 rounded-full px-4 py-1.5 text-sm font-medium ${
                post.status === "published"
                  ? "bg-[#A7D7A0] text-[#2E2E2E]"
                  : post.status === "scheduled"
                    ? "bg-[#CFEFFF] text-[#0EA5E9]"
                    : "bg-[#FFD54F] text-[#2E2E2E]"
              }`}>
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </div>
            </div>

            {/* Thumbnails */}
            {post.media && post.media.length > 1 && (
              <div className="flex gap-3">
                {post.media.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-16 h-16 rounded-[12px] overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Post Details Card */}
          <div className="rounded-[20px] bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            {/* Author & Platform */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-foreground">
                    {session?.user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{session?.user.name}</p>
                  <p className="text-sm text-muted-foreground">{post.postType}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {post.platform === "instagram" ? (
                  <SiInstagram className="h-5 w-5 text-[#E1306C]" />
                ) : post.platform === "twitter" ?(
                  <SiX className="h-5 w-5 text-black" />
                ) : (
                  <SiTiktok className="h-5 w-5 text-[#69C9D0]" />
                )}
                
                <span className="text-sm font-medium capitalize">{post.platform}</span>
              </div>
            </div>

            {/* Caption */}
            <div className="py-4">
              <p className="text-foreground whitespace-pre-wrap">{post.caption}</p>
            </div>

            {/* Schedule Info */}
            {post.scheduledAt && post.status === "scheduled" && (
              <div className="flex items-center gap-2 py-4 border-t border-border">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Scheduled for {new Date(post.scheduledAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}

            {post.scheduledAt && Date.now() >= new Date(post.scheduledAt).getTime() && post.status === "published" && (
              <div className="flex items-center gap-2 py-4 border-t border-border">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Published on {new Date(post.scheduledAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Link
                href={`/dashboard/posts/${post.id}/edit`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-[16px] bg-secondary px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit Post
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-[16px] bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Metrics Card - Only for Published Posts */}
          {post.status === "published" && metrics && (
            <div className="rounded-[20px] bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Post Performance</h3>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-[16px] bg-secondary p-4 text-center">
                  <Heart className="h-5 w-5 mx-auto text-red-500 mb-2" />
                  <p className="text-xl font-bold text-foreground">{formatNumber(metrics?.likes)}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div className="rounded-[16px] bg-secondary p-4 text-center">
                  <MessageCircle className="h-5 w-5 mx-auto text-[#0EA5E9] mb-2" />
                  <p className="text-xl font-bold text-foreground">{formatNumber(metrics?.comments)}</p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
                <div className="rounded-[16px] bg-secondary p-4 text-center">
                  <Share2 className="h-5 w-5 mx-auto text-[#F59E0B] mb-2" />
                  <p className="text-xl font-bold text-foreground">{formatNumber(metrics?.shares)}</p>
                  <p className="text-xs text-muted-foreground">Shares</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-[16px] bg-[#E8F5E9] p-4 text-center">
                  <Eye className="h-5 w-5 mx-auto text-primary mb-2" />
                  <p className="text-xl font-bold text-foreground">{formatNumber(metrics?.views)}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div className="rounded-[16px] bg-[#CFEFFF]/50 p-4 text-center">
                  <Users className="h-5 w-5 mx-auto text-[#0EA5E9] mb-2" />
                  <p className="text-xl font-bold text-foreground">{formatNumber(metrics?.reach)}</p>
                  <p className="text-xs text-muted-foreground">Reach</p>
                </div>
                <div className="rounded-[16px] bg-[#FFD54F]/20 p-4 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto text-[#F59E0B] mb-2" />
                  <p className="text-xl font-bold text-foreground">{formatNumber(metrics?.engagement)}</p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
              </div>
            </div>
          )}

          {/* Draft/Scheduled Notice */}
          {!isPublished && (
            <div className="rounded-[20px] bg-[#FFD54F]/10 border border-[#FFD54F]/30 p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#FFD54F] p-2">
                  <Calendar className="h-4 w-4 text-[#2E2E2E]" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {post.status === "draft" ? "Draft Post" : "Scheduled Post"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {post.status === "draft" 
                      ? "This post has not been published yet. Metrics will be available once it goes live."
                      : `This post is scheduled to be published. Metrics will be available after ${new Date(post.scheduledAt!).toLocaleDateString()}.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
