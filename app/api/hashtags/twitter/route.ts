import { auth } from '@/lib/auth';
import { getTwitterTrending } from '@/lib/apify';
import redis from '@/lib/redis';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) throw { message: 'Unauthorized', status: 401 };

    const cacheKey = `twitter_hashtags_${session.user.id}`;
    const cached = await redis.get(cacheKey);
    if (cached) return Response.json(JSON.parse(cached));

    const interests = session.user.interests || [];
    const searchTerms = interests.map((topic: string) => `(${topic}) (min_faves:200) -is:retweet`);

    const items = await getTwitterTrending({
      maxItems: 50,
      searchTerms,
      sort: 'Top',
      tweetLanguage: 'en',
    });

    const hashtags: Record<string, number> = {};
    items.forEach((tweet: any) => {
      const tags = tweet.text.match(/#\w+/g) || [];
      tags.forEach((tag: string) => {
        const key = tag.replace(/^#/, '');
        hashtags[key] = (hashtags[key] || 0) + 1;
      });
    });

    const topHashtags = Object.entries(hashtags)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);

    await redis.set(cacheKey, JSON.stringify({ hashtags: topHashtags }), 'EX', 60 * 60 * 24);

    return Response.json({ hashtags: topHashtags });
  } catch (err) {
    console.error('Twitter hashtags error:', err);

    // Optional fallback
    // const cached = await redis.get(`twitter_hashtags_${session.user.id}`);
    // if (cached) return Response.json(JSON.parse(cached));

    return Response.json({ error: 'Failed to fetch Twitter hashtags' }, { status: 500 });
  }
}
