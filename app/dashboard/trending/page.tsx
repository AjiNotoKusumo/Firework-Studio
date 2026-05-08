'use client';

import { useEffect, useState } from 'react';
import { PostCard } from '@/components/dashboard/post-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { TrendingPostModal } from '@/components/dashboard/trending-post-modal';
import { TrendingPost } from '@/types';

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
  const [twitterHashtags, setTwitterHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDataInstagram() {
    try {
      setLoading(true);
      const interests: string[] = []; // user interests can be added later

      const [hashtagsRes, postsRes] = await Promise.all([
        fetch('/api/hashtags', {
          method: 'POST',
          body: JSON.stringify({ interests }),
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/trending/instagram', {
          method: 'POST',
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
        .sort((a: any, b: any) => b.value - a.value)
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
      // setPosts(formattedPosts);
      setPosts((prev) => [...prev, ...formattedPosts]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDataTwitter() {
    try {
      setLoading(true);

      const [hashtagsRes, postsRes] = await Promise.all([
        fetch('/api/hashtags/twitter'),
        fetch('/api/trending/twitter'),
      ]);

      const hashtagsData = await hashtagsRes.json().catch(() => ({ hashtags: [] }));
      const postsData = await postsRes.json().catch(() => []);

      // ---------------- TWITTER HASHTAGS ----------------
      const formattedTwitterHashtags: Hashtag[] = (hashtagsData.hashtags || [])
        .map((tag: any) => ({ name: tag.name.replace(/^#/, ''), value: tag.value || 0 }))
        .slice(0, 20); // pick top 20 trends

      // ---------------- TWITTER POSTS ----------------
      const formattedPosts: TrendingPost[] = (postsData || []).map((post: any, i: number) => ({
        id: post.id || `tweet-${i}`,
        imageUrl:
          post.media?.[0] ||
          'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg',
        caption: post.text || '',
        likes: post.likesCount || 0,
        comments: post.replyCount || 0,
        shares: post.retweetCount || 0,
        status: getStatus(post.likesCount || 0, post.replyCount || 0),
        platform: 'twitter',
        author: { name: post.author?.userName || 'unknown', avatar: '' },
        url: post.url || '',
      }));

      setTwitterHashtags(formattedTwitterHashtags);
      // setPosts(formattedPosts);
      setPosts((prev) => [...prev, ...formattedPosts]);
    } catch (err) {
      console.error('Error fetching Twitter data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDataTwitter();
    fetchDataInstagram();
  }, []);

  const handleSavePost = (postId: string) => {
    setSavedPosts((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]));
  };

  return (
    <div className="p-8">
      {/* HASHTAGS */}
      <section className="mb-8 flex flex-col gap-6">
        <ChartCard
          title="Top Instagram Hashtags"
          subtitle="Live Instagram hashtag popularity"
          data={hashtags}
          type="bar"
        />
      </section>

      {/* ---------------- TWITTER HASHTAGS FLEX GRID ---------------- */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Top Twitter Hashtags</h2>
        <p className="text-sm text-muted-foreground mb-4">Live trending hashtags</p>

        <div className="flex flex-wrap gap-3">
          {twitterHashtags.map((tag) => (
            <div
              key={tag.name}
              className="inline-flex items-center justify-center rounded-lg 
                   bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 
                   font-semibold text-center text-base sm:text-lg 
                   px-12 py-2 break-words whitespace-nowrap max-w-[500px]
                   cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out">
              #{tag.name}
            </div>
          ))}
        </div>
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
            {posts.map((post, index) => (
              <button
                key={`post-${post.id}-${index}`}
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
