// app/api/trending-posts/route.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers, // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
      throw { message: 'Unauthorized', status: 401 };
    }

    const interests = session.user.interests || [];

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
  }
}
