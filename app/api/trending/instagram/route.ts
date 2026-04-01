// app/api/trending-posts/route.ts
export const runtime = 'nodejs';

import { getInstagramTrending } from '@/lib/apify';
import { auth } from '@/lib/auth';
import { getTopicUrls } from '@/lib/gemini';
// import redis from '@/lib/redis';

export async function POST(req: Request) {
  try {

    const session = await auth.api.getSession({
        headers: req.headers // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
        throw { message: 'Unauthorized', status: 401 };
    }

    // const cachedPosts = await redis.get(`trending_instagram_${session.user.id}`);

    // if (cachedPosts) {
    //   console.log('Returning cached trending posts for user:', session.user.id);
    //   return Response.json(JSON.parse(cachedPosts));
    // }

    const interests = session.user.interests || [];
    
    // 1️⃣ AI → topic URLs
    const urls = await getTopicUrls(interests || []);

    // 2️⃣ Apify → scrape trending posts
    const items = await getInstagramTrending(urls);

    // 3️⃣ Map to frontend-ready structure
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

    // await redis.set(`trending_instagram_${session.user.id}`, JSON.stringify(trendingPosts), 'EX', 60 * 60 * 24);

    return Response.json(trendingPosts);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch trending posts' }, { status: 500 });
  }
}
