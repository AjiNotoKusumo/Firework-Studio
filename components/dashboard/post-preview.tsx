'use client';

import Image from 'next/image';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

type PostPreviewProps = {
  formData: {
    images?: string[];
    caption?: string;
    platform?: 'instagram' | 'twitter';
  };
};

export function PostPreview({ formData }: PostPreviewProps) {
  const image = formData.images?.[0];
  const caption = formData.caption || '';

  // simple parser for @ and #
  const renderCaption = (text: string) => {
    return text.split(/(\s+)/).map((part, i) => {
      if (part.startsWith('@') || part.startsWith('#')) {
        return (
          <span key={i} className="text-blue-500">
            {part}
          </span>
        );
      }
      if (part.startsWith('http')) {
        return (
          <span key={i} className="text-blue-500 underline">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // ───────────────────────── INSTAGRAM ─────────────────────────
  if (formData.platform === 'instagram') {
    return (
      <div className="w-full max-w-md bg-white border border-border rounded-lg overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
            <span className="text-sm font-semibold">username</span>
          </div>
        </div>

        {/* IMAGE */}
        {image && (
          <div className="relative w-full aspect-square">
            <Image src={image} alt="preview" fill className="object-cover" />
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-between items-center p-3">
          <div className="flex gap-4">
            <Heart className="w-5 h-5" />
            <MessageCircle className="w-5 h-5" />
            <Share2 className="w-5 h-5" />
          </div>
          <Bookmark className="w-5 h-5" />
        </div>

        {/* CAPTION */}
        <div className="px-3 pb-3 text-sm">
          <span className="font-semibold mr-1">username</span>
          {caption ? renderCaption(caption) : 'Your caption...'}
        </div>
      </div>
    );
  }

  // ───────────────────────── TWITTER ─────────────────────────
  return (
    <div className="w-full max-w-xl bg-white border border-border rounded-lg p-4">
      <div className="flex gap-3">
        {/* AVATAR */}
        <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />

        <div className="flex-1">
          {/* HEADER */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold">Full Name</span>
            <span className="text-muted-foreground">@username</span>
            <span className="text-muted-foreground">· now</span>
          </div>

          {/* TEXT */}
          <p className="text-sm mt-1 whitespace-pre-line">{caption ? renderCaption(caption) : 'Your tweet...'}</p>

          {/* IMAGE */}
          {image && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mt-2 border">
              <Image src={image} alt="preview" fill className="object-cover" />
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex justify-between mt-3 text-muted-foreground text-xs">
            <span>💬 0</span>
            <span>🔁 0</span>
            <span>❤️ 0</span>
            <span>📊 0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
