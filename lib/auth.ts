import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/lib/prisma';
import { genericOAuth } from 'better-auth/plugins/generic-oauth';
import { instagramConfig } from "better-auth-instagram";

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
    plugins: [
        genericOAuth({
            config: [
                instagramConfig({
                    getEmail: (profile) => `${profile.username}@example.com`,
                    scopes: ["instagram_business_basic", "instagram_business_content_publish", "instagram_business_manage_comments", "instagram_business_manage_insights", "instagram_business_manage_messages"],
                    fields: ["id", "name", "username", "account_type"],
                    appId: process.env.INSTAGRAM_APP_ID,
                    appSecret: process.env.INSTAGRAM_APP_SECRET
                })
            ]
        })
    ],
    databaseHooks: {
        account: {
            create: {
                after: async (account : any) => {
                    if(account.providerId === "instagram") {
                        try {
                            const shortLivedToken = account.accessToken;
                            const appId = process.env.INSTAGRAM_APP_ID;
                            const appSecret = process.env.INSTAGRAM_APP_SECRET;

                            const response = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`);

                            const data = await response.json();

                            if(data.access_token) {
                                const expiresAt = new Date(Date.now() + data.expires_in * 1000);

                                await prisma.account.update({
                                    where: { id: account.id },
                                    data: { 
                                        accessToken: data.access_token,
                                        accessTokenExpiresAt: expiresAt 
                                    }
                                });

                                console.log("Instagram token exchanged and saved for account:", account.id);
                            } else {
                                console.error("Failed to exchange Instagram token:", data);
                            }
                        } catch (err) {
                            console.error("Error linking Instagram account:", err);
                        }
                    }
                }
            }
        }
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
  trustedOrigins: ["http://127.0.0.1:3000", "http://localtest.me:3000", "https://ease-queensland-applied-cap.trycloudflare.com", "https://operator-retirement-stage-treatments.trycloudflare.com"],
});
