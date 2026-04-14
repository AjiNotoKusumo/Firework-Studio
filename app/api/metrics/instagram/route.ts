import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/* ================= TYPES ================= */

type IGMedia = {
  id: string;
  like_count?: number;
  comments_count?: number;
};

type IGResponse = {
  followers_count: number;
  media_count: number;
  media: {
    data: IGMedia[];
  };
};

/* ================= API ================= */

export async function GET(req: Request): Promise<Response> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "instagram",
      },
    });

    if (!account) {
      return Response.json(
        { error: "No Instagram account found" },
        { status: 404 }
      );
    }

    /* ================= FETCH BASIC DATA ================= */

    const url = `https://graph.instagram.com/v25.0/${account.accountId}?fields=followers_count,media_count,media{like_count,comments_count}&access_token=${account.accessToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      const err = await response.json();
      console.error("IG API error:", err);

      return Response.json(
        { error: "Failed to fetch Instagram data" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as IGResponse;

    /* ================= PROCESS DATA ================= */

    const posts = data.media?.data ?? [];

    const totalLikes = posts.reduce(
      (sum, p) => sum + (p.like_count ?? 0),
      0
    );

    const totalComments = posts.reduce(
      (sum, p) => sum + (p.comments_count ?? 0),
      0
    );

    const totalEngagement = totalLikes + totalComments;

    const avgLikes =
      posts.length > 0 ? totalLikes / posts.length : 0;

    const bestPost =
      posts.length > 0
        ? posts.reduce((best, current) => {
            const bestScore =
              (best.like_count ?? 0) + (best.comments_count ?? 0);
            const currentScore =
              (current.like_count ?? 0) +
              (current.comments_count ?? 0);

            return currentScore > bestScore ? current : best;
          })
        : null;

    const engagementRate =
      data.followers_count > 0
        ? totalEngagement / data.followers_count
        : 0;

    /* ================= FINAL RESPONSE ================= */

    return Response.json(
      {
        followers: data.followers_count,
        posts: data.media_count,

        totalLikes,
        totalComments,
        totalEngagement,
        avgLikes,

        engagementRate,

        bestPost,

        rawPosts: posts, // optional (for UI)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Instagram API error:", error);

    return Response.json(
      { error: "Failed to fetch Instagram metrics" },
      { status: 500 }
    );
  }
}