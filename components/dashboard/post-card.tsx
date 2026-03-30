'use client';

import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PostCardProps {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  status: 'trending' | 'growing' | 'stable';
  platform: 'instagram' | 'twitter';
  author: {
    name: string;
    avatar: string;
  };
}

export function PostCard({ imageUrl, caption, likes, comments, shares, status, platform, author }: PostCardProps) {
  return (
    <div className="group rounded-[20px] bg-card p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-[16px] bg-[#E8F5E9]">
        <Image
          loading="eager"
          src={imageUrl}
          alt={caption}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div
          className={cn(
            'absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-medium',
            status === 'trending' && 'bg-[#FFD54F] text-[#2E2E2E]',
            status === 'growing' && 'bg-[#A7D7A0] text-[#2E2E2E]',
            status === 'stable' && 'bg-[#CFEFFF] text-[#2E2E2E]',
          )}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      {/* Author */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[#A7D7A0] flex items-center justify-center overflow-hidden">
          <span className="text-xs font-medium text-[#2E2E2E]">{author.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{author.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{platform}</p>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-3 text-sm text-foreground line-clamp-2">{caption}</p>

      {/* Metrics */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-4 w-4" />
            <span className="text-xs">{formatNumber(likes)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{formatNumber(comments)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Share2 className="h-4 w-4" />
            <span className="text-xs">{formatNumber(shares)}</span>
          </div>
        </div>
        <div className="rounded-[12px] p-2 text-muted-foreground hover:bg-[#E8F5E9] hover:text-[#2E2E2E] transition-colors">
          <Bookmark className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
