import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
        headers: req.headers // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
        throw { message: 'Unauthorized', status: 401 };
    }

    const { accessToken } = await auth.api.getAccessToken({
        body: { providerId: "twitter" },
        headers: await headers() // Pass current request headers for session context
    });

    if (!accessToken) {
        throw { message: 'No access token found for Twitter', status: 403 };
    }

    const responseProfile = await fetch(
        "https://api.x.com/2/users/me?user.fields=public_metrics",
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`, // The token from Better Auth
            },
        }
    );

    const resultProfile = await responseProfile.json();

    const userId = resultProfile.data?.id;

    if (!userId) {
        throw { message: 'Failed to retrieve user ID from Twitter profile', status: 500 };
    }

    const responsePost = await fetch(
        `https://api.x.com/2/users/${userId}/tweets?max_results=100&tweet.fields=created_at,public_metrics,organic_metrics,attachments&expansions=attachments.media_keys&media.fields=type`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`, // The token from Better Auth
            },
        }
    );

    
    const resultPost = await responsePost.json();

    if (!responseProfile.ok || !responsePost.ok) {
        const errorResponse = !responseProfile.ok ? responseProfile : responsePost;
        const errorResult = !responseProfile.ok ? resultProfile : resultPost;
        console.log("Twitter API error:", await errorResponse.text());
        const errorMessage = errorResult.detail || errorResult.errors?.[0]?.message || 'Unknown Twitter Error';
        throw { message: errorMessage, status: errorResponse.status };
    }

    const twitterMetrics = {
        followers: resultProfile.data.public_metrics?.followers_count,
        posts: resultProfile.data.public_metrics?.tweet_count,
        like: resultPost.data.reduce((acc: number, tweet: any) => acc + (tweet.public_metrics?.like_count || 0), 0),
        views: resultPost.data.reduce((acc: number, tweet: any) => acc + (tweet.public_metrics?.impression_count || 0), 0),
    }
    
    console.log(resultPost.data);
    
    return NextResponse.json( twitterMetrics );
  } catch (error) {
    let err = error as { message: string, status: number }
    console.log("Error fetching posts:", error)
    return Response.json({ error: err.message ||'Failed to fetch posts' }, { status: 500 })
  }
  
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const session = await auth.api.getSession({
            headers: req.headers // This is now automatically populated with the cookies
        });

        if (!session || !session.user) {
            throw { message: 'Unauthorized', status: 401 };
        }

        const { accessToken } = await auth.api.getAccessToken({
            body: { providerId: "twitter" },
            headers: await headers() // Pass current request headers for session context
        });

        if (!accessToken) {
            throw { message: 'No access token found for Twitter', status: 403 };
        }

        const response = await fetch("https://api.x.com/2/tweets", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: body.caption }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.log("Twitter API error:", await response.text());
            const errorMessage = result.detail || result.errors?.[0]?.message || 'Unknown Twitter Error';
            throw { message: errorMessage, status: response.status };
        }

        return NextResponse.json(result.data);
    } catch (error) {
        let err = error as { message: string, status: number }
        console.log("Error fetching posts:", error)
        return Response.json({ error: err.message ||'Failed to fetch posts' }, { status: 500 })
    }
}