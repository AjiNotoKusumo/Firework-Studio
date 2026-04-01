// app/api/trending-tweets/route.ts
export const runtime = 'nodejs';

import { auth } from '@/lib/auth';
<<<<<<< HEAD
import { headers } from 'next/headers';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers, // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
      throw { message: 'Unauthorized', status: 401 };
    }
=======
import { getTwitterTrending } from '@/lib/apify';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) throw { message: 'Unauthorized', status: 401 };
>>>>>>> a4ee9f5dbd461651c0f7574547eb1ac52de0fe2d

    const interests = session.user.interests || [];
    const searchTerms = interests.map(
      (topic: string) => `(${topic} OR ai OR developer OR coding OR technology) (min_faves:200) -is:retweet`
    );

<<<<<<< HEAD
    const { accessToken } = await auth.api.getAccessToken({
      body: { providerId: 'twitter' },
      headers: await headers(), // Pass current request headers for session context
    });

    if (!accessToken) {
      throw { message: 'No access token found for Twitter', status: 403 };
    }

    const query = `(${interests.join(' OR ')}) has:media -is:retweet -is:reply`;

    // 2. Encode the query for the URL (crucial for spaces and parentheses)
    const encodedQuery = encodeURIComponent(query);

    const postSearch = await fetch(
      `https://api.x.com/2/tweets/search/all?query=${encodedQuery}&sort_order=relevancy&tweet.fields=public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url&max_results=30`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`, // The token from Better Auth
        },
      },
    );

    const postResult = await postSearch.json();

    console.log('Twitter API search result:', postResult);

    // 3️⃣ Map to frontend-ready structure
    // const trendingPosts = items.map((item: any) => ({
    //   caption: item.caption,
    //   ownerFullName: item.ownerFullName,
    //   ownerUsername: item.ownerUsername,
    //   url: item.url,
    //   commentsCount: item.commentsCount,
    //   likesCount: item.likesCount,
    //   timestamp: item.timestamp,
    //   shortCode: item.shortCode,
    //   displayUrl: item.displayUrl,
    // }));

    return Response.json(postResult);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch trending posts' }, { status: 500 });
=======
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
>>>>>>> a4ee9f5dbd461651c0f7574547eb1ac52de0fe2d
  }
}