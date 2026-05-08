import { auth } from "@/lib/auth";
import PostModel from "@/lib/models/PostModel";
import { headers } from "next/headers";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const url = `https://graph.instagram.com/v25.0/${id}`;

        const session = await auth.api.getSession({
            headers: req.headers // This is now automatically populated with the cookies
        });

        if (!session || !session.user) {
            throw { message: 'Unauthorized', status: 401 };
        }

        const { accessToken } = await auth.api.getAccessToken({
            body: { providerId: "instagram" },
            headers: await headers() // Pass current request headers for session context
        });

        if (!accessToken) {
            throw { message: 'No access token found for Instagram', status: 403 };
        }

        const basicInfo = await fetch(`${url}?fields=media_type,like_count,comments_count,timestamp&access_token=${accessToken}`)

        const basicInfoRes = await basicInfo.json();

        if (!basicInfo.ok) {
            throw { message: 'Failed to fetch post metrics from Instagram', status: basicInfo.status };
        }

        const insightInfo = await fetch(`${url}/insights?metric=shares,saved,views,reach,total_interactions&access_token=${accessToken}`)

        const insightInfoRes = await insightInfo.json();
        if (!insightInfo.ok) {
            console.error("Instagram API insight error:", insightInfoRes);
            throw { message: 'Failed to fetch post insights from Instagram', status: insightInfo.status };
        }

        console.log("Instagram post metrics response:", basicInfoRes);
        console.log("Instagram post insights response:", insightInfoRes.data.map((metric: any) => {
            return metric.values
        }));

        return Response.json({
            likes: basicInfoRes.like_count || 0,
            comments: basicInfoRes.comments_count || 0,
            shares: insightInfoRes.data.find((metric: any) => metric.name === "shares")?.values[0].value || 0,
            views: insightInfoRes.data.find((metric: any) => metric.name === "views")?.values[0].value || 0,
            reach: insightInfoRes.data.find((metric: any) => metric.name === "reach")?.values[0].value || 0,
            engagement: insightInfoRes.data.find((metric: any) => metric.name === "total_interactions")?.values[0].value || 0,
        }, { status: 200 });
    } catch (error) {
        let err = error as { message: string, status: number }
        console.log("Error fetching posts:", error)
        return Response.json({ error: err.message ||'Failed to fetch posts' }, { status: 500 })
    }
}