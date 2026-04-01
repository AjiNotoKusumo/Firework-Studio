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

    static async getAllPostsByUser(userId: string) {
        const posts = await prisma.post.findMany({
            where: { userId },
            include: {
                media: true
            }
        });

        return posts;
    }

    static async getPostById(postId: string) {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                media: true
            }
        });

        if (!post) {
            throw { message: "Post not found", status: 404 };
        }
        
        return post;
    }


    static async createPost(data: any) {
        const { userId, caption, hashtags, platform, status, postType, scheduledAt } = data;

        if (!userId) {
            throw { message: "userId is required to create a post", status: 400 };
        }

        if (!platform) {
            throw { message: "platform is required to create a post", status: 400 };
        }

        const post = await prisma.post.create({
            data: {
                userId,
                caption,
                hashtags,
                platform,
                postType,
                status,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            },
        })

        return post;
    }   

    static async updatePost(postId: string, data: any) {
        const { userId, caption, hashtags, platform, status, postType, scheduledAt, qstashId, twitterId, instagramId } = data;

        if (!postId) {
            throw { message: "postId is required to update a post", status: 400 };
        }

        console.log("Updating post with data:", postId);

        const postExists = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!postExists) {
            throw { message: "Post not found", status: 404 };
        }

        const post = await prisma.post.update({
            where: { id: postId },
            data: {
                userId,
                caption,
                hashtags,
                platform,
                status,
                postType,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                qstashId: qstashId || null,
                twitterId: twitterId || null,
                instagramId: instagramId || null,
                media: {
                    deleteMany: {}, // This will remove existing media associations
                    create: data.images ? data.images.map((url: string, index: number) => ({ url, order: index + 1 })) : [], // Add new media associations
                },
            },
        });

        return post;
    }

    static async deletePost(postId: string) {
        if (!postId) {
            throw { message: "postId is required to delete a post", status: 400 };
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw { message: "Post not found", status: 404 };
        }

        await prisma.post.delete({
            where: { id: postId },
        });

        return { message: "Post deleted successfully" };
    }

    static async saveTrendingPosts(userId: string, post: any) {
        if (!userId) {
            throw { message: "userId is required to update a post", status: 400 };
        }

        const savedPost = await prisma.savedPost.create({
            data: {
                userId,
                postData: post,
            }
        })
        return savedPost;
    }

    static async getTrendingPosts(userId: string) {
        if (!userId) {
            throw { message: "userId is required to get trending posts", status: 400 };
        }

        const savedPosts = await prisma.savedPost.findMany({
            where: { userId },
        });

        return savedPosts;
    }

    static async deleteSavedPost(savedPostId: string) {
        if (!savedPostId) {
            throw { message: "savedPostId is required to delete a saved post", status: 400 };

        }

        const savedPost = await prisma.savedPost.findUnique({
            where: { id: savedPostId },
        });

        if (!savedPost) {
            throw { message: "Saved post not found", status: 404 };
        }

        await prisma.savedPost.delete({
            where: { id: savedPostId },
        });

        return { message: "Saved post deleted successfully" };
    }

    static async savePlanning(planningData: any) {
        if (!planningData) {
            throw { message: "Planning data is required", status: 400 };
        }

        const {postId, concept, globalStyle, structure, scenes} = planningData;

        const planning = await prisma.planning.create({
            data: {
                postId,
                concept,
                globalStyle,
                structure,
                scenes: {
                    create: scenes.map((scene: any) => ({
                        sceneNumber: scene.sceneNumber,
                        scene: scene
                    })),
                },
            }
        })
        
        return planning;

    }

    static async getPlanningByUser(userId: string) {
        if (!userId) {
            throw { message: "userId is required to get planning data", status: 400 };
        }

        const plannings = await prisma.planning.findMany({
            where: {
                post: {
                    userId
                }
            },
            include: {
                scenes: {
                    orderBy: { sceneNumber: "asc" }
                }
            }
        });

        return plannings;
    }

    static async getSceneByPlanning(planId: string) {
        if (!planId) {
            throw { message: "planId is required to get scene data", status: 400 };
        }

        const scenes = await prisma.scene.findMany({
            where: { planningId: planId },
            orderBy: { sceneNumber: "asc" }
        });
        return scenes;
    }

    static async getPlanningByPost(postId: string) {
        if (!postId) {
            throw { message: "postId is required to get planning data", status: 400 };
        }

        const planning = await prisma.planning.findMany({
            where: { postId },
            include: {
                scenes: {
                    orderBy: { sceneNumber: "asc" }
                }
            }
        });
        return planning;
    }

    static async editPlanning(planId: string, planningData: any) {
        if (!planId) {
            throw { message: "planId is required to edit planning data", status: 400 };
        }

        const {postId, concept, globalStyle, structure, scenes} = planningData;

        const updatedPlanning = await prisma.planning.update({
            where: { id: planId },
            data: {
                postId,
                concept,
                globalStyle,
                structure,
                scenes: {
                    deleteMany: {},
                    create: scenes.map((scene: any) => ({
                        sceneNumber: scene.sceneNumber,
                        scene: scene
                    })),
                },
            }
        });

        return updatedPlanning;
    }
}