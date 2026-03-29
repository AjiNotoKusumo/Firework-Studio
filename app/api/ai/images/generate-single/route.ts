import { generateSingleImage } from "@/lib/gemini";


export async function POST(req: Request) {
    try {
        const { scene, globalStyle, structure, concept } = await req.json();

        const result = await generateSingleImage(scene, globalStyle, structure, concept);

        return Response.json(result);
    } catch (error) {
        console.log("Error generating image:", error)
        return Response.json({ error: 'Failed to generate images' }, { status: 500 })
    }
}