import { auth } from "@/lib/auth";
import PostModel from "@/lib/models/PostModel";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
        headers: req.headers // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
        throw { message: 'Unauthorized', status: 401 };
    }

    const postData = await req.json();

    const response = await PostModel.saveTrendingPosts(session.user.id, postData);

    return Response.json({"message": "Post created successfully", "data": response }, { status: 201 })
  } catch (error) {
    let err = error as { message: string, status: number }
    console.log("Error creating post:", error)
    return Response.json({ error: err.message ||'Failed to create post' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
        headers: req.headers // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
        throw { message: 'Unauthorized', status: 401 };
    }

    const response = await PostModel.getTrendingPosts(session.user.id);
    return Response.json({ data: response }, { status: 200 });
  } catch (error) {
    let err = error as { message: string, status: number }
    console.log("Error fetching trending posts:", error)
    return Response.json({ error: err.message ||'Failed to fetch trending posts' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({
        headers: req.headers // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
        throw { message: 'Unauthorized', status: 401 };
    }

    const postId = await req.json();

    const response = await PostModel.deleteSavedPost(postId.postId);

    return Response.json({ data: response }, { status: 200 });
  } catch (error) {
    let err = error as { message: string, status: number }
    console.log("Error deleting saved post:", error)
    return Response.json({ error: err.message ||'Failed to delete saved post' }, { status: 500 })
  }
}