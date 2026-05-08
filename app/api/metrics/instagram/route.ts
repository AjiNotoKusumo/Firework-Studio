import { auth } from "@/lib/auth";
import PostModel from "@/lib/models/PostModel";
import { qstashClient } from "@/lib/qstash";

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

const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

const generateMonths = (startYear: number) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (Jan = 0)

  const months = [];

  for (let i = 0; i <= currentMonth; i++) {
    const date = new Date(startYear, i, 1);

    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const label = date.toLocaleString("en-US", { month: "short" });

    months.push({
      key,
      label,
      views: 0,
    });
  }

  return months;
}

const getBestDay = (groupedByDay: any) => {
  const baseDays: Record<number, string> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

  const bestDayEntry = Object.entries(groupedByDay).sort((a : any, b : any) => b[1] - a[1])[0];
  return baseDays[Number(bestDayEntry[0])];
}

const getPeakTime = (groupedByHour: any) => {
  const peakHourEntry = Object.entries(groupedByHour).sort((a: any, b: any) => b[1] - a[1])[0];

  const peakHour = Number(peakHourEntry[0]);

  const startHour = peakHour;
  const endHour = (peakHour + 2) % 24;

  const formatHour = (h: number) => h.toString().padStart(2, "0") + ":00";

  return `${formatHour(startHour)} - ${formatHour(endHour)}`;
}

/* ================= API ================= */

const instagramUrl = `https://graph.instagram.com/v25.0`

export async function GET(req: Request): Promise<Response> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const account = await PostModel.findInstagramAccount(session.user.id, "instagram");

    if (!account) {
      return Response.json(
        { error: "No Instagram account found" },
        { status: 404 }
      );
    }

    /* ================= FETCH BASIC DATA ================= */

    const url = `${instagramUrl}/${account.accountId}?fields=followers_count,media_count,media{timestamp,like_count,comments_count}&access_token=${account.accessToken}`;

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

    // console.log("Instagram data response:", data.media?.data);

    const insightData = await Promise.all(data.media?.data.map(async (media: any) => {
      const insightResponse = await fetch(`${instagramUrl}/${media.id}/insights?metric=shares,saved,views,reach,total_interactions&access_token=${account.accessToken}`);

      const insightInfoRes = await insightResponse.json();
      // if (!insightResponse.ok) {
      //     console.log("Instagram API insight error:", insightInfoRes);
      //     throw { message: 'Failed to fetch post insights from Instagram', status: insightResponse.status };
      // }

      return {
        date: media.timestamp,
        shares: insightInfoRes.data ? insightInfoRes.data.find((metric: any) => metric.name === "shares")?.values[0].value : 0,
        views: insightInfoRes.data ? insightInfoRes.data.find((metric: any) => metric.name === "views")?.values[0].value : 0,
        reach: insightInfoRes.data ? insightInfoRes.data.find((metric: any) => metric.name === "reach")?.values[0].value : 0,
        engagement: insightInfoRes.data ? insightInfoRes.data.find((metric: any) => metric.name === "total_interactions")?.values[0].value : 0,
      }
    }))

    const groupedByMonth = insightData.reduce((acc : any, post) => {
      const date = new Date(post.date);

      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; 

      if(date.getFullYear() === new Date().getFullYear()) {
        if (!acc[monthKey]) {
          acc[monthKey] = {
            views: 0,
            engagement: 0,
          };
        }

        acc[monthKey].views += post.views;
        acc[monthKey].engagement += post.engagement;
      }
    
      return acc;
    }, {});

    const groupedByDay = insightData.reduce((acc : any, post) => {
      const day = new Date(post.date).getDay();

      if (!acc[day]) acc[day] = 0;

      acc[day] += post.engagement;

      return acc;
    }, {});

    const groupedByHour = insightData.reduce((acc: any, post) => {
      const hour = new Date(post.date).getHours(); // 0–23

      if (!acc[hour]) acc[hour] = 0;

      acc[hour] += post.engagement;

      return acc;
    }, {});

    const baseMonths = generateMonths(new Date().getFullYear());
    
    const viewsHistory = baseMonths.map((month) => {
      const existing = groupedByMonth[month.key];

      return {
        name: month.label,
        value: existing ? existing.views : 0,
      };
    });

    const engagementHistory = baseMonths.map((month) => {
      const existing = groupedByMonth[month.key];

      return {
        name: month.label,
        value: existing ? existing.engagement : 0,
      };
    });

    const posts = data.media?.data ?? [];

    const likes = posts.reduce(
      (sum, p) => sum + (p.like_count ?? 0),
      0
    );

    const comments = posts.reduce(
      (sum, p) => sum + (p.comments_count ?? 0),
      0
    );

    const avgLikes =
      posts.length > 0 ? likes / posts.length : 0;

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
        ? (insightData.reduce((sum, i) => sum + (i.engagement ?? 0), 0) / (insightData.reduce((sum, i) => sum + (i.views ?? 0), 0))) * 100
        : 0;
    
    const avgEngagement = engagementRate.toFixed(1) + "%";
    /* ================= FINAL RESPONSE ================= */

    return Response.json(
      {
        followers: formatNumber(data.followers_count),
        posts: formatNumber(data.media_count),

        likes: formatNumber(likes),
        comments: formatNumber(comments),
        views: formatNumber(insightData.reduce((sum, i) => sum + (i.views ?? 0), 0)),
        totalEngagement: formatNumber(insightData.reduce((sum, i) => sum + (i.engagement ?? 0), 0)),
        avgLikes,
        viewsHistory,
        engagementHistory,
        bestDay: getBestDay(groupedByDay),
        peakTime: getPeakTime(groupedByHour),
        topFormat: `${insightData.sort((a, b) => b.engagement - a.engagement)[0].engagement} Engagement`,

        avgEngagement,

        bestPost,

        rawPosts: posts, // optional (for UI)
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Instagram API error:", error);

    return Response.json(
      { error: "Failed to fetch Instagram metrics" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const retryDelay = 15
  const maxRetry = 3

  try {
    const body = await req.json();
    const {postId, retryCount = 0} = body;

    if(!postId) {
      throw { message: "postId is required", status: 400 }
    }

    const post = await PostModel.getPostById(postId);

    if (!post) {
      throw { message: "Post not found", status: 404 }
    }

    const account = await PostModel.findInstagramAccount(body.userId, "instagram");

    if (!account) {
      throw { message: "No Instagram account found", status: 404 }
    }

    if(!body.images || body.images.length <= 0) {
      throw { message: "At least one image is required", status: 400 }
    }

    if(!post.instagramId) {
      let containerId = ""

      if (body.images.length === 1) {
        const container = await fetch(`${instagramUrl}/${account.accountId}/media`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${account.accessToken}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            caption: body.caption,
            image_url: body.images[0],
          })
        })

        const containerData = await container.json();

        if (!container.ok) {
          throw { message: containerData.error?.message || "Failed to create media container", status: container.status || 500 }
        }

        containerId = containerData.id;
      } else {
        const childIds = await Promise.all(body.images.map(async (image: string) => {
          const res = await fetch(`${instagramUrl}/${account.accountId}/media`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${account.accessToken}`, 
              "Content-Type": "application/json" 
            },
            body: JSON.stringify({
              image_url: image,
              is_carousel_item: true
            })
          })

          const data = await res.json();

          if (!res.ok) {
            throw { message: data.error?.message || "Failed to create media container", status: res.status || 500 }
          }

          return data.id;
        }));

        const parentContainer = await fetch(`${instagramUrl}/${account.accountId}/media`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${account.accessToken}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            caption: body.caption,
            children: childIds.join(","),
            media_type: "CAROUSEL",
          })
        })

        const parentData = await parentContainer.json();

        if (!parentContainer.ok) {
          throw { message: parentData.error?.message || "Failed to create parent media container", status: parentContainer.status || 500 }
        }

        containerId = parentData.id;
      }
      
      await PostModel.updatePost(postId, { instagramId: containerId, status: "scheduled", ...body });

      await qstashClient.publishJSON({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/metrics/instagram`,
        delay: retryDelay,
        body: { 
          ...body, 
          retryCount: retryCount + 1 }
      })

      console.log("Media container created, waiting to publish...")

      return Response.json({ message: "Media container created, post will be published shortly" }, { status: 200 });
    }

    const status = await fetch(`${instagramUrl}/${post.instagramId}?fields=status_code&access_token=${account.accessToken}`);

    const statusData = await status.json();

    if(statusData.status_code !== "FINISHED") {
      if(retryCount >= maxRetry) {
        throw { message: "Max retry attempts reached, post could not be published", status: 500 }
      }

      await qstashClient.publishJSON({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/metrics/instagram`,
        delay: retryDelay,
        body: { 
          ...body, 
          retryCount: retryCount + 1 }
      })

      console.log(`Media not ready, retrying... Attempt ${retryCount + 1} of ${maxRetry}`)

      return Response.json({ message: `Media not ready, retrying...` }, { status: 200 });
    }

    if(statusData.status_code === "ERROR") {
      throw { message: "Error processing media, cannot publish", status: 500 }
    }

    if(statusData.status_code === "FINISHED") {
      const publish = await fetch(`${instagramUrl}/${account.accountId}/media_publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          creation_id: post.instagramId,
        })
      })

      const publishData = await publish.json();

      await PostModel.updatePost(postId, {
        ...body,
        status: "published",
        qstashId: null,
        instagramId: publishData.id,
      })
      
      console.log("Post published to Instagram with ID:", publishData.id);

      return Response.json({ postId: publishData.id, status: statusData.status_code }, { status: 200 });
    }
    
  } catch (error) {
    let err = error as { message: string, status: number }
    console.log("Error fetching posts:", error)
    return Response.json({ error: err.message ||'Failed to create post' }, { status: err.status || 500 })
  }
}