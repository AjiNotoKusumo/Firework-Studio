import { generateAllImages } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const script = await req.json();

        const images = await generateAllImages(script);

        return Response.json(images);
    } catch (error) {
        console.log("Error generating images:", error)
        return Response.json({ error: 'Failed to generate images' }, { status: 500 })
    }
  
}