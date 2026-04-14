import { createAuthClient } from "better-auth/react";
import { genericOAuthClient, inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL, 
    plugins: [
        inferAdditionalFields({
            user: {
                interests: { type: "string[]" },
                onboardingComplete: { type: "boolean" }
            }
        }),
        genericOAuthClient()
    ]
});

export const { signIn, signUp, signOut, useSession } = authClient;