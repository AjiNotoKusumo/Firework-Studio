'use client';

import Image from 'next/image';
import { Heart, MessageCircle, Share2, Bookmark, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type MediaItem = {
  url: string;
  type: 'image' | 'video';
};

type PostPreviewProps = {
  formData: {
    media?: MediaItem[]; // preferred — supports images + videos
    images?: string[]; // legacy fallback — images only
    caption?: string;
    platform?: 'instagram' | 'twitter' | 'tiktok';
  };
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Coerce legacy `images[]` into MediaItem[] so the rest of the code is uniform */
function resolveMedia(formData: PostPreviewProps['formData']): MediaItem[] {
  if (formData.media?.length) return formData.media.filter((m) => !!m.url);
  return (formData.images ?? []).filter(Boolean).map((url) => ({ url, type: 'image' as const }));
}

function renderCaption(text: string) {
  return text.split(/(\s+)/).map((part, i) => {
    if (part.startsWith('@') || part.startsWith('#'))
      return (
        <span key={i} className="text-blue-500">
          {part}
        </span>
      );
    if (part.startsWith('http'))
      return (
        <span key={i} className="text-blue-500 underline">
          {part}
        </span>
      );
    return part;
  });
}

// ─── SINGLE MEDIA CELL (image or video) ──────────────────────────────────────
function MediaSlide({
  item,
  active,
  objectFit = 'cover',
}: {
  item: MediaItem;
  active: boolean;
  objectFit?: 'cover' | 'contain';
}) {
  const [muted, setMuted] = useState(true);

  if (item.type === 'video') {
    return (
      <div className="relative w-full h-full bg-black">
        <video
          src={item.url}
          autoPlay={active}
          loop
          muted={muted}
          playsInline
          className="w-full h-full"
          style={{ objectFit }}
        />
        {/* mute / unmute */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => !m);
          }}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center z-20 hover:bg-black/80 transition-colors">
          {muted ?
            <VolumeX className="w-3.5 h-3.5" />
          : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        {/* play indicator badge */}
        <div className="absolute top-2 left-2 text-[10px] text-white bg-black/50 rounded px-1.5 py-0.5 font-medium z-10 tracking-wide">
          VIDEO
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image src={item.url} alt="media" fill style={{ objectFit }} />
    </div>
  );
}

// ─── INSTAGRAM CAROUSEL ──────────────────────────────────────────────────────
function InstagramCarousel({ media }: { media: MediaItem[] }) {
  const [current, setCurrent] = useState(0);
  const total = media.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden group">
      {/* sliding track */}
      <div
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}>
        {media.map((item, i) => (
          <div key={i} className="relative h-full w-full flex-shrink-0">
            <MediaSlide item={item} active={i === current} />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          {/* arrows */}
          {current > 0 && (
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {current < total - 1 && (
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* dot indicators — video slides get a ▶ icon */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {media.map((item, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="rounded-full transition-all duration-200 flex items-center justify-center overflow-hidden"
                style={{
                  width: i === current ? 16 : 6,
                  height: 6,
                  background: i === current ? '#3B82F6' : 'rgba(255,255,255,0.6)',
                }}>
                {item.type === 'video' && i === current && (
                  <span style={{ fontSize: 5, color: 'white', lineHeight: 1 }}>▶</span>
                )}
              </button>
            ))}
          </div>

          {/* counter */}
          <div className="absolute top-2 right-2 text-xs text-white bg-black/50 rounded-full px-2 py-0.5 font-medium z-10">
            {current + 1}/{total}
          </div>
        </>
      )}
    </div>
  );
}

// ─── TWITTER MEDIA GRID ──────────────────────────────────────────────────────
function TwitterMediaGrid({ media }: { media: MediaItem[] }) {
  const count = Math.min(media.length, 4);
  const shown = media.slice(0, count);
  const extra = media.length - 4;

  const Cell = ({
    item,
    active = true,
    className = '',
    style = {},
  }: {
    item: MediaItem;
    active?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <MediaSlide item={item} active={active} objectFit={item.type === 'video' ? 'contain' : 'cover'} />
    </div>
  );

  if (count === 1) {
    return (
      <div className="rounded-xl overflow-hidden mt-2 border" style={{ aspectRatio: '16/9' }}>
        <Cell item={shown[0]} className="w-full h-full" />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden mt-2" style={{ aspectRatio: '16/9' }}>
        {shown.map((item, i) => (
          <Cell key={i} item={item} className="w-full h-full" />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden mt-2" style={{ aspectRatio: '16/9' }}>
        <Cell item={shown[0]} className="row-span-2 w-full h-full" />
        <Cell item={shown[1]} className="w-full" style={{ aspectRatio: '16/9' }} />
        <Cell item={shown[2]} className="w-full" style={{ aspectRatio: '16/9' }} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden mt-2" style={{ aspectRatio: '1' }}>
      {shown.map((item, i) => (
        <div key={i} className="relative aspect-square overflow-hidden">
          {i === 3 && extra > 0 && (
            <div className="absolute inset-0 z-10 bg-black/55 flex items-center justify-center text-white font-bold text-xl">
              +{extra}
            </div>
          )}
          <Cell item={item} active={false} className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}

// TikTok carousel
function TikTokCarousel({ media }: { media: MediaItem[] }) {
  const [current, setCurrent] = useState(0);
  const total = media.length;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <div
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}>
        {media.map((item, i) => (
          <div key={i} className="relative h-full w-full flex-shrink-0">
            <MediaSlide item={item} active={i === current} objectFit="contain" />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === current ? 16 : 6,
                  background: i === current ? 'white' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
          <div className="absolute top-3 right-3 text-[10px] text-white bg-black/50 rounded-full px-2 py-0.5 z-10">
            {current + 1}/{total}
          </div>
        </>
      )}
    </div>
  );
}

function TikTokPreview({ media, caption }: { media: MediaItem[]; caption: string }) {
  return (
    <div className="w-full max-w-[360px] bg-black text-white rounded-2xl overflow-hidden border border-white/10">
      <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
        {media.length > 0 ? (
          <TikTokCarousel media={media} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
            Your media...
          </div>
        )}

        <div className="absolute top-2 left-0 right-0 flex items-center justify-center text-xs font-semibold">
          <span className="opacity-70">Following</span>
          <span className="mx-2 opacity-40">|</span>
          <span>For You</span>
        </div>

        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4 text-[11px]">
          <div className="w-9 h-9 rounded-full bg-gray-300 border-2 border-white" />
          <div className="flex flex-col items-center">
            <Heart className="w-6 h-6" />
            <span className="mt-1">0</span>
          </div>
          <div className="flex flex-col items-center">
            <MessageCircle className="w-6 h-6" />
            <span className="mt-1">0</span>
          </div>
          <div className="flex flex-col items-center">
            <Bookmark className="w-6 h-6" />
            <span className="mt-1">0</span>
          </div>
          <div className="flex flex-col items-center">
            <Share2 className="w-6 h-6" />
            <span className="mt-1">0</span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        <div className="absolute left-3 right-16 bottom-3 text-sm">
          <div className="font-semibold">@username</div>
          <div className="text-xs mt-1">{caption ? renderCaption(caption) : 'Your caption...'}</div>
          <div className="text-[11px] mt-2 opacity-80">Original sound - username</div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function PostPreview({ formData }: PostPreviewProps) {
  const media = resolveMedia(formData);
  const caption = formData.caption || '';

  // ───────────────────────── INSTAGRAM ─────────────────────────
  if (formData.platform === 'instagram') {
    return (
      <div className="w-full max-w-md bg-white border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
            <span className="text-sm font-semibold">username</span>
          </div>
        </div>

        {media.length > 0 && <InstagramCarousel media={media} />}

        <div className="flex justify-between items-center p-3">
          <div className="flex gap-4">
            <Heart className="w-5 h-5" />
            <MessageCircle className="w-5 h-5" />
            <Share2 className="w-5 h-5" />
          </div>
          <Bookmark className="w-5 h-5" />
        </div>

        <div className="px-3 pb-3 text-sm">
          <span className="font-semibold mr-1">username</span>
          {caption ? renderCaption(caption) : 'Your caption...'}
        </div>
      </div>
    );
  }

  if (formData.platform === 'tiktok') {
    return <TikTokPreview media={media} caption={caption} />;
  }

  // ───────────────────────── TWITTER ─────────────────────────
  return (
    <div className="w-full max-w-xl bg-white border border-border rounded-lg p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold">Full Name</span>
            <span className="text-muted-foreground">@username</span>
            <span className="text-muted-foreground">· now</span>
          </div>

          <p className="text-sm mt-1 whitespace-pre-line">{caption ? renderCaption(caption) : 'Your tweet...'}</p>

          {media.length > 0 && <TwitterMediaGrid media={media} />}

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
