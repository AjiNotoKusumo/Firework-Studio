import { NextResponse } from "next/server"
import { mockPosts, type Post } from "@/lib/posts-data"
import PostModel from "@/lib/models/PostModel";
import { auth } from "@/lib/auth";

// In-memory store (would be a database in production)
let posts = [...mockPosts]

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
      throw { message: 'Unauthorized', status: 401 };
    }

    const { id } = await params
  
    const post = await PostModel.getPostById(id)
    
    return NextResponse.json(post)
  } catch (error) {
    let err = error as { message: string, status: number }
    console.log("Error fetching post:", error)
    return Response.json({ error: err.message || 'Failed to fetch post' }, { status: err.status || 500 })
  }
  
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
      throw { message: 'Unauthorized', status: 401 };
    }

    const { id } = await params
    const postData = await req.json()
    
    const updatedPost = await PostModel.updatePost(id, {
      userId: session.user.id,
      scheduledAt: postData.scheduledAt,
      caption: postData.caption,
      hashtags: postData.hashtags,
      platform: postData.platform,
      postType: postData.postType,
      status: postData.status
    })
    
    return Response.json({"message": "Post updated successfully"}, { status: 200 })
  } catch (error) {
    let err = error as { message: string, status: number }
    return Response.json({"message": err.message || "Failed to update post"}, { status: err.status || 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const deletePost = await PostModel.deletePost(id)
    
    return Response.json({"message": "Post deleted successfully"}, { status: 200 })
  } catch (error) {
    let err = error as { message: string, status: number }
    return Response.json({"message": err.message || "Failed to delete post"}, { status: err.status || 500 })
  }

  
}
