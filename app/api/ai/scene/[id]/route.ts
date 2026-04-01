import { auth } from "@/lib/auth";
import PostModel from "@/lib/models/PostModel";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        console.log("Fetching scenes for planning ID: new", id);

        const session = await auth.api.getSession({
            headers: req.headers // This is now automatically populated with the cookies
        });

        if (!session || !session.user) {
            throw { message: 'Unauthorized', status: 401 };
        }

        const response = await PostModel.getSceneByPlanning(id);
        return Response.json(response, { status: 200 });
    } catch (error) {
        let err = error as { message: string, status: number }
        console.log("Error saving planning:", error)
        return Response.json({ error: err.message ||'Failed to save planning' }, { status: 500 })
    }
}