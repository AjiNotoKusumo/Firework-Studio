import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/lib/prisma';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true, 
    },
    socialProviders:{
        twitter: { 
            clientId: process.env.TWITTER_CLIENT_ID as string, 
            clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
            scope: [
                "users.read", 
                "tweet.read", 
                "tweet.write", 
                "offline.access",
                "media.write"
            ], 
            mapProfileToUser: async (profile) => {
                return {
                    email: profile.data.email ?? `${profile.data.id}@twitter.placeholder.com`,
                    name: profile.data.name || profile.data.username,
                    image: profile.data.profile_image_url,
                    emailVerified: true,
                };
            }, 
        },
    },
    session: {
        cookieCache: {
        enabled: true,
        strategy: "jwt",
        },
    },
    account: {
        accountLinking: {
            enabled: true,
            allowDifferentEmails: true
        }
    },
    user: {
        additionalFields: {
            interests: {
                type: "string[]", 
                required: false,
            },
            onboardingComplete: {
                type: "boolean",
                defaultValue: false
            }
        }
    },
  trustedOrigins: ["http://127.0.0.1:3000", "http://localtest.me:3000"]
});
