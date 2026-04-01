import { qstashClient } from "@/lib/qstash"; // The client we made in Step 4
import { NextResponse } from "next/server";
import PostModel from "@/lib/models/PostModel";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { caption, images, scheduledAt, userId, postId } = body;

    const existingPost = await PostModel.getPostById(postId);

    if (!existingPost) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost?.qstashId) {
      try {
        await qstashClient.messages.delete(existingPost.qstashId);
        console.log("Old schedule canceled:", existingPost.qstashId);
      } catch (err) {
        console.warn("Could not delete old message (it might have already fired)");
      }
    }


    const targetDate = new Date(scheduledAt);
    const now = new Date();
    const delayInSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);

    if (delayInSeconds < 0) {
      return Response.json({ error: "Cannot schedule in the past" }, { status: 400 });
    }

    // 2. Publish to QStash
    const result = await qstashClient.publishJSON({
      // IMPORTANT: This is the URL of the WORKER we will build in Step 6
      url: "http://localtest.me:3000/api/metrics/twitter",
      
      delay: delayInSeconds,
      
      // This is the data QStash will "carry" and give back to us later
      body: {...body},
    });

    console.log("QStash publish result:", result);

    await PostModel.updatePost(postId, {
        status: "scheduled",
        qstashId: result.messageId,
        scheduledAt: targetDate.toISOString(),
        ...body
    })

    // 3. Return the messageId so you can save it in your DB
    return Response.json({ 
      success: true, 
      messageId: result.messageId 
    });

  } catch (error) {
    console.error("Scheduling error:", error);
    return Response.json({ error: "Failed to schedule" }, { status: 500 });
  }
}
