import { NextResponse } from 'next/server';
import { mockPosts, type Post } from '@/lib/posts-data';
import { auth } from "@/lib/auth";
import PostModel from "@/lib/models/PostModel";

// In-memory store (would be a database in production)
let posts = [...mockPosts];

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
        headers: req.headers // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
        throw { message: 'Unauthorized', status: 401 };
    }

    const userPosts = await PostModel.getAllPostsByUser(session.user.id);

    return NextResponse.json(userPosts);
  } catch (error) {
    let err = error as { message: string, status: number }
    console.log("Error fetching posts:", error)
    return Response.json({ error: err.message ||'Failed to fetch posts' }, { status: 500 })
  }
  
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
        headers: req.headers // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
        throw { message: 'Unauthorized', status: 401 };
    }

    const postData = await req.json();

    const response = await PostModel.createPost({
      userId: session.user.id,
      scheduledAt: postData.scheduledAt,
      caption: postData.caption,
      hashtags: postData.hashtags,
      platform: postData.platform,
      postType: postData.postType,
      status: postData.status
    });

    return Response.json({"message": "Post created successfully", "data": response }, { status: 201 })
  } catch (error) {
    let err = error as { message: string, status: number }
    console.log("Error creating post:", error)
    return Response.json({ error: err.message ||'Failed to create post' }, { status: 500 })
  }
}
