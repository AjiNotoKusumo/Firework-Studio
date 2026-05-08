'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Heart, MessageCircle, Share2, Bookmark, ExternalLink, Instagram, Twitter, Sparkles } from 'lucide-react';
import { TrendingPost } from '@/types';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import Toastify from 'toastify-js';

interface TrendingPostModalProps {
  post: TrendingPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (postsId: string) => void;
  isSaved?: boolean;
  postId?: string;
  fetchSavedPosts?: () => void;
}

const statusConfig = {
  trending: { label: '🔥 Trending', className: 'bg-[#FFD54F] text-[#2E2E2E]' },
  growing: { label: '📈 Growing', className: 'bg-[#A7D7A0] text-[#2E2E2E]' },
  stable: { label: '📊 Stable', className: 'bg-[#CFEFFF] text-[#2E2E2E]' },
};

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

export function TrendingPostModal({ post, open, onOpenChange, onSave, isSaved = false, postId, fetchSavedPosts }: TrendingPostModalProps) {
  const router = useRouter();
  if (!post) return null;

  const handleSave = async () => {
    try {
      if(postId) {
        console.log("Deleting post with ID:", postId);
        const res = await fetch('/api/posts/trending', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to save post');
        }

        Toastify({
          text: `Post removed successfully`,
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top", // `top` or `bottom`
          position: "right", // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: "#A7D7A0",
            color: "#2E2E2E",
            borderRadius: "12px", 
            border: "1px solid rgba(46, 111, 64, 0.1)"
          },
        }).showToast();

        fetchSavedPosts?.();
        return onSave?.(post.id);
      }

      const res = await fetch('/api/posts/trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save post');
      }

      Toastify({
        text: `Post saved successfully`,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "#A7D7A0",
          color: "#2E2E2E",
          borderRadius: "12px", 
          border: "1px solid rgba(46, 111, 64, 0.1)"
        },
      }).showToast();

      onSave?.(post.id);

    } catch (error) {
      const message = (error as Error).message;
      console.log("Error saving post:", message);
      Toastify({
        text: `${message}`,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "#FF8A8A",
          color: "#2E2E2E",
          borderRadius: "12px", 
          border: "1px solid rgba(46, 111, 64, 0.1)"
        },
      }).showToast();
    }
  }

  const status = statusConfig[post.status];
  const PlatformIcon = post.platform === 'instagram' ? Instagram : Twitter;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-6xl p-0 rounded-[24px] overflow-hidden border border-border shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden">
          {/* ═══ LEFT — Image ═══ */}
          <div className="relative sm:w-[40%] flex-shrink-0 bg-muted overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="w-full h-52 sm:h-full sm:absolute sm:inset-0 object-cover"
            />
            <span
              className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold shadow-sm ${status.className}`}>
              {status.label}
            </span>
            <span className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <PlatformIcon className="h-3.5 w-3.5 text-[#2E2E2E]" />
            </span>
          </div>

          {/* ═══ RIGHT — Content ═══ */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-border">
                {post.author.avatar ?
                  <img src={post.author.avatar} alt={post.author.name} className="h-full w-full object-cover" />
                : <span className="text-sm font-semibold text-muted-foreground">{post.author.name.charAt(0)}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-sm font-semibold leading-tight truncate">{post.author.name}</DialogTitle>
                <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                  <PlatformIcon className="h-3 w-3" />
                  <span className="text-[11px] capitalize">{post.platform}</span>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Caption
                </p>
                <p className="text-sm leading-relaxed text-foreground">{post.caption}</p>
              </div>

              <div className="border-t border-border" />

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Engagement
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center gap-1.5 rounded-[12px] bg-[#FFD54F]/10 border border-[#FFD54F]/30 py-3">
                    <div className="h-7 w-7 rounded-full bg-[#FFD54F]/20 flex items-center justify-center">
                      <Heart className="h-3 w-3 text-[#D97706]" />
                    </div>
                    <p className="text-sm font-bold">{formatNumber(post.likes)}</p>
                    <p className="text-[10px] text-muted-foreground">Likes</p>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 rounded-[12px] bg-[#CFEFFF]/40 border border-[#CFEFFF] py-3">
                    <div className="h-7 w-7 rounded-full bg-[#CFEFFF]/60 flex items-center justify-center">
                      <MessageCircle className="h-3 w-3 text-[#0EA5E9]" />
                    </div>
                    <p className="text-sm font-bold">{formatNumber(post.comments)}</p>
                    <p className="text-[10px] text-muted-foreground">Comments</p>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 rounded-[12px] bg-[#A7D7A0]/20 border border-[#A7D7A0]/40 py-3">
                    <div className="h-7 w-7 rounded-full bg-[#A7D7A0]/30 flex items-center justify-center">
                      <Share2 className="h-3 w-3 text-[#22C55E]" />
                    </div>
                    <p className="text-sm font-bold">{formatNumber(post.shares)}</p>
                    <p className="text-[10px] text-muted-foreground">Shares</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-[12px] bg-secondary/60 border border-border p-3">
                <Sparkles className="h-3.5 w-3.5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Hit <span className="font-semibold text-foreground">Use as Template</span> to copy this image and
                  caption into your draft.
                </p>
              </div>
            </div>

            {/* Footer — always anchored, never clipped */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-t border-border flex-shrink-0 bg-card">
              {/* Save — icon + label, fixed width */}
              <button
                onClick={() =>  { handleSave()}}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] border text-xs font-medium transition-all flex-shrink-0 ${
                  isSaved ?
                    'border-[#FFD54F] bg-[#FFD54F]/10 text-[#D97706]'
                  : 'border-border bg-background hover:bg-secondary text-foreground'
                }`}>
                <Bookmark className={`h-3.5 w-3.5 flex-shrink-0 ${isSaved ? 'fill-[#FFD54F] text-[#D97706]' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </button>

              {/* Use as Template — grows to fill space */}
              <button
                onClick={() => onSave?.(post.id)}
                className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#A7D7A0] hover:bg-[#8BC483] text-[#2E2E2E] text-xs font-medium transition-colors">
                <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Use</span>
              </button>

              {/* Original — fixed width */}
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-border bg-background hover:bg-secondary text-xs font-medium transition-colors text-foreground flex-shrink-0"
                onClick={() => window.open(post.url, '_blank')}>
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                Original
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
