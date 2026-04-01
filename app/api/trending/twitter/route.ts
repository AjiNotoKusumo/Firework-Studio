// app/api/trending-tweets/route.ts
export const runtime = 'nodejs';

import { auth } from '@/lib/auth';
import { getTwitterTrending } from '@/lib/apify';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) throw { message: 'Unauthorized', status: 401 };

    const interests = session.user.interests || [];
    const searchTerms = interests.map(
      (topic: string) => `(${topic} OR ai OR developer OR coding OR technology) (min_faves:200) -is:retweet`
    );

    const items = await getTwitterTrending({
      maxItems: 50,
      searchTerms,
      sort: 'Latest',
      tweetLanguage: 'en',
    });

    const trendingTweets = items.map((tweet: any) => ({
      id: tweet.id,
      text: tweet.text,
      fullText: tweet.fullText || tweet.text,
      url: `https://x.com/${tweet.username}/status/${tweet.id}`,
      twitterUrl: `https://twitter.com/${tweet.username}/status/${tweet.id}`,
      createdAt: tweet.timestamp,
      likesCount: tweet.likesCount || 0,
      retweetCount: tweet.retweetsCount || 0,
      replyCount: tweet.repliesCount || 0,
      media: tweet.media && tweet.media.length ? [tweet.media[0]] : [],
      author: {
        userName: tweet.username,
        name: tweet.fullName,
        profilePicture: tweet.profilePicture || '',
        url: `https://x.com/${tweet.username}`,
        twitterUrl: `https://twitter.com/${tweet.username}`,
      },
    }));

    return Response.json(trendingTweets);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch trending tweets' }, { status: 500 });
  }
}