import { auth } from '@/lib/auth';
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {

    const session = await auth.api.getSession({
        headers: req.headers // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
        throw { message: 'Unauthorized', status: 401 };
    }

    const interests = session.user.interests || [];

    const { accessToken } = await auth.api.getAccessToken({
        body: { providerId: "twitter" },
        headers: await headers() // Pass current request headers for session context
    });

    if (!accessToken) {
        throw { message: 'No access token found for Twitter', status: 403 };
    }

    const response = await fetch(`https://api.x.com/2/trends/by/woeid/23424846?trend.fields=tweet_count,trend_name&max_trends=50`, {
        headers: {
            Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
    });

    const postResult = await response.json();

    console.log("Twitter API search result:", postResult);

    return Response.json(postResult);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch trending posts' }, { status: 500 });
  }
}

