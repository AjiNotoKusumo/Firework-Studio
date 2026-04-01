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

    const planningData = await req.json();

    const response = await PostModel.savePlanning(planningData);

    return Response.json({"message": "Planning saved successfully", "data": response }, { status: 201 })
  } catch (error) {
    let err = error as { message: string, status: number }
    console.log("Error saving planning:", error)
    return Response.json({ error: err.message ||'Failed to save planning' }, { status: 500 })
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

        const response = await PostModel.getPlanningByUser(session.user.id);
        return Response.json(response, { status: 200 });
    } catch (error) {
        let err = error as { message: string, status: number }
        console.log("Error saving planning:", error)
        return Response.json({ error: err.message ||'Failed to save planning' }, { status: 500 })
    }
}


export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({
        headers: req.headers // This is now automatically populated with the cookies
    });

    if (!session || !session.user) {
        throw { message: 'Unauthorized', status: 401 };
    }

    const { finalPayload, planId } = await req.json();

    const response = await PostModel.editPlanning(planId, finalPayload);

    return Response.json({"message": "Planning saved successfully", "data": response }, { status: 201 })
  } catch (error) {
    let err = error as { message: string, status: number }
    console.log("Error saving planning:", error)
    return Response.json({ error: err.message ||'Failed to save planning' }, { status: 500 })
  }
}
