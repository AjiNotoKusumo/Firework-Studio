// app/api/trending-posts/route.ts
export const runtime = 'nodejs';

import { getInstagramTrending } from '@/lib/apify';
import { auth } from '@/lib/auth';
import { getTopicUrls } from '@/lib/gemini';
import redis from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) throw { message: 'Unauthorized', status: 401 };

    const cacheKey = `trending_instagram_${session.user.id}`;

    // 1️⃣ Check Redis cache first
    const cachedPosts = await redis.get(cacheKey);
    if (cachedPosts) {
      console.log('Returning cached trending posts for user:', session.user.id);
      return Response.json(JSON.parse(cachedPosts));
    }

    // 2️⃣ No cache, fetch fresh
    const interests = session.user.interests || [];
    const urls = await getTopicUrls(interests);

    const items = await getInstagramTrending(urls);

    const trendingPosts = items.map((item: any) => ({
      caption: item.caption,
      ownerFullName: item.ownerFullName,
      ownerUsername: item.ownerUsername,
      url: item.url,
      commentsCount: item.commentsCount,
      likesCount: item.likesCount,
      timestamp: item.timestamp,
      shortCode: item.shortCode,
      displayUrl: item.displayUrl,
    }));

    // 3️⃣ Store in Redis for 24 hours
    await redis.set(cacheKey, JSON.stringify(trendingPosts), 'EX', 60 * 60 * 24); // 24h expiry

    return Response.json(trendingPosts);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch trending posts' }, { status: 500 });
  }
}
