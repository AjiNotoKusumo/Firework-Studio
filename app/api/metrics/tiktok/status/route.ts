import { auth } from "@/lib/auth";
import { qstashClient } from "@/lib/qstash";
import PostModel from "@/lib/models/PostModel";

const handleTikTokResponse = async (response: Response) => {
  const data = await response.json();

  // HTTP-level failure
  if (!response.ok) {
    throw new Error(
      data?.error?.message || "TikTok request failed"
    );
  }

  // TikTok-level failure
  if (data.error && data.error.code !== "ok") {
    throw new Error(
      `${data.error.code}: ${data.error.message}`
    );
  }

  return data;
};

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (body.retryCount > 3) {
            throw { message: "Max retry attempts reached, post could not be published", status: 500 }
        }

        const { accessToken } = await auth.api.getAccessToken({
            body: { 
                providerId: "tiktok",
                userId: body.userId
            },
        });

        if (!accessToken) {
            throw { message: 'No access token found for TikTok', status: 403 };
        }

        const statusResponse = await fetch(
            "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        publish_id: body.publish_id,
                    }),
                }
        );

        const statusData = await handleTikTokResponse(statusResponse);

        if (statusData.data?.status === "PUBLISH_COMPLETE") {
            console.log("post data", statusData.data)

            const post = await PostModel.getPostById(body.postId);
            
            if (!post) {
                throw { message: "Post not found", status: 404 }
            }

            await PostModel.updatePost(body.postId, {
                ...body,
                status: "published",
                tiktokId: body.publish_id,
                qstashId: null,
            })

            return Response.json({statusData}, { status: 200 });
        } else if(statusData.data?.status === "FAILED") {
            throw { message: "Post failed to publish on TikTok", status: 500 }
        } else {
            console.log("Post is still processing on TikTok");
            await qstashClient.publishJSON({
                url: `${process.env.NEXT_PUBLIC_APP_URL}/api/metrics/tiktok/status`,
                delay: 10,
                body: { 
                    ...body, 
                    retryCount: (body.retryCount || 0) + 1 
                }
            })
        }
       
    } catch (error) {
        let err = error as { message: string, status: number }
        console.log("Error fetching posts:", error)
        return Response.json({ error: err.message ||'Failed to create post' }, { status: err.status || 500 })
    }
}