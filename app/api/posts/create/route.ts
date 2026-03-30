import { auth } from "@/lib/auth";
import PostModel from "@/lib/models/PostModel";
import { th } from "date-fns/locale";


export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers // This is now automatically populated with the cookies
        });

        if (!session || !session.user) {
            throw { message: 'Unauthorized', status: 401 };
        }

        const postData = await req.json();

        const response = await PostModel.createPost(postData);

        return Response.json({"message": "Post created successfully", "data": response }, { status: 201 })
    } catch (error) {
        let err = error as { message: string, status: number }
        console.log("Error creating post:", error)
        return Response.json({ error: err.message ||'Failed to create post' }, { status: 500 })
    }
  
}