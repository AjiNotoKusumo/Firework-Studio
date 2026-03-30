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

    static async createPost(data: any) {
        const { userId, caption, hashtags, platform, status, scheduledAt } = data;

        if (!userId) {
            throw { message: "userId is required to create a post", status: 400 };
        }

        if (!platform) {
            throw { message: "platform is required to create a post", status: 400 };
        }

        const user = await prisma.post.create({
            data: {
                userId,
                caption,
                hashtags,
                platform,
                status,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            },
        })

        return user;
    }   
}