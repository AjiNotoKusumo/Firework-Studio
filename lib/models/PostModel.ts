import { embed } from "../gemini";
import prisma from "@/lib/prisma";


export default class PostModel {
    static async findBestSounds(scene: any) {
        const queryText = `
            ${scene.description}
            ${scene.emotion}
            ${scene.purpose}
        `;

        const queryEmbedding = await embed(queryText);

        if(!queryEmbedding) {
            throw new Error("Failed to generate embedding for the query");
        }

        const vector = `[${queryEmbedding.join(",")}]`;

        const results : any[] = await prisma.$queryRaw`
            SELECT id, name, url, description, category,
                embedding <-> ${vector}::vector AS distance
            FROM "SoundEffect"
            ORDER BY distance ASC
            LIMIT 3;
        `;

        return results;
    }
}