'use client';

import { useEffect, useState } from 'react';
import { PostCard } from '@/components/dashboard/post-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { TrendingPostModal } from '@/components/dashboard/trending-post-modal';

// ---------------- TYPES ----------------
type Hashtag = { name: string; value: number };
type ApiPost = {
  caption: string;
  ownerFullName: string;
  ownerUsername: string;
  url: string;
  commentsCount: number;
  likesCount: number;
  timestamp: string;
  shortCode: string;
  displayUrl?: string;
};
type TrendingPost = {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  status: 'trending' | 'growing' | 'stable';
  platform: 'instagram';
  author: { name: string; avatar: string };
};

// ---------------- HELPERS ----------------
const getStatus = (likes: number, comments: number): TrendingPost['status'] => {
  const score = likes + comments * 2;
  if (score > 20000) return 'trending';
  if (score > 8000) return 'growing';
  return 'stable';
};
const buildImageUrl = (shortCode: string) => `https://www.instagram.com/p/${shortCode}/media/?size=l`;

// ---------------- COMPONENT ----------------
export default function TrendingPage() {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<TrendingPost | null>(null);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const interests: string[] = []; // user interests can be added later

        const [hashtagsRes, postsRes] = await Promise.all([
          fetch('/api/hashtags', {
            method: 'POST',
            body: JSON.stringify({ interests }),
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch('/api/trending', {
            method: 'POST',
            body: JSON.stringify({ interests }),
            headers: { 'Content-Type': 'application/json' },
          }),
        ]);

        const hashtagsData = await hashtagsRes.json().catch(() => ({ hashtags: [] }));
        const postsDataRaw = await postsRes.json();
        const postsData: ApiPost[] = Array.isArray(postsDataRaw) ? postsDataRaw : [];

        // ---------------- HASHTAGS ----------------
        const formattedHashtags: Hashtag[] = (hashtagsData.hashtags || [])
          .map((tag: any) => ({
            name: tag.name,
            value: tag.value,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);

        // ---------------- POSTS ----------------
        const formattedPosts: TrendingPost[] = (postsData || []).map((post: ApiPost, i: number) => ({
          id: post.shortCode || `post-${i}`,
          imageUrl: post.displayUrl || buildImageUrl(post.shortCode),
          caption: post.caption || '',
          likes: post.likesCount || 0,
          comments: post.commentsCount || 0,
          shares: Math.floor((post.likesCount || 0) * 0.1),
          status: getStatus(post.likesCount || 0, post.commentsCount || 0),
          platform: 'instagram',
          author: { name: post.ownerUsername || 'unknown', avatar: '' },
          url: post.url || '',
        }));

        setHashtags(formattedHashtags);
        setPosts(formattedPosts);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSavePost = (postId: string) => {
    setSavedPosts((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]));
  };

  return (
    <div className="p-8">
      {/* HASHTAGS */}
      <section className="mb-8">
        <ChartCard title="Top Hashtags" subtitle="Live Instagram hashtag popularity" data={hashtags} type="bar" />
      </section>

      {/* POSTS */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Trending Posts</h2>
          <p className="text-sm text-muted-foreground mt-1">Live trending content based on your interests</p>
        </div>

        {loading ?
          <div className="text-sm text-muted-foreground">Loading...</div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="text-left transition-transform hover:scale-[1.02]">
                <PostCard {...post} />
              </button>
            ))}
          </div>
        }
      </section>

      {/* MODAL */}
      <TrendingPostModal
        post={selectedPost}
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
        onSave={handleSavePost}
        isSaved={selectedPost ? savedPosts.includes(selectedPost.id) : false}
      />
    </div>
  );
}
