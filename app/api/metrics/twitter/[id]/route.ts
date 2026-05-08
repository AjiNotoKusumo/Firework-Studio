import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

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

        const responsePost = await fetch(
            `https://api.x.com/2/tweets/${id}?tweet.fields=public_metrics,organic_metrics`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`, // The token from Better Auth
                },
            }
        );

        const resultPost = await responsePost.json();

        if (!responsePost.ok) {
            console.log("Twitter API error:", await responsePost.text());
            throw { message: 'Failed to fetch post metrics from Twitter', status: responsePost.status };
        }

        console.log("Twitter post metrics response:", resultPost);

        return Response.json({
            likes: resultPost.data.public_metrics.like_count || 0,
            comments: resultPost.data.public_metrics.reply_count || 0,
            shares: resultPost.data.public_metrics.retweet_count + resultPost.data.public_metrics.quote_count || 0,
            views: resultPost.data.public_metrics.impression_count || 0,
            reach: resultPost.data.public_metrics.impression_count || 0,
            engagement: resultPost.data.public_metrics.like_count + resultPost.data.public_metrics.reply_count + resultPost.data.public_metrics.retweet_count + resultPost.data.public_metrics.quote_count + resultPost.data.public_metrics.bookmark_count || 0,
        }, { status: 200 });
    } catch (error) {
        let err = error as { message: string, status: number }
        console.log("Error fetching posts:", error)
        return Response.json({ error: err.message ||'Failed to fetch posts' }, { status: 500 })
    }
}