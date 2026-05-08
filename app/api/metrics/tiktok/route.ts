
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { qstashClient } from "@/lib/qstash";

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

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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

const getTopFormat = (videos: any[]) => {
    const sorted = videos.sort((a: any, b: any) => (
            (b.like_count || 0) +
            (b.comment_count || 0) +
            (b.share_count || 0)
        ) - (
            (a.like_count || 0) +
            (a.comment_count || 0) +
            (a.share_count || 0)
        ));

    if (sorted.length === 0) return "-";

    const topPost = sorted[0].like_count+sorted[0].comment_count+sorted[0].share_count;

    return `${topPost} Engagement`
}

const handleTikTokResponse = async (response: Response) => {
  const data = await response.json();

  // HTTP-level failure
  if (!response.ok) {
    throw new Error(
      data?.error?.message || "TikTok request failed"
    );
  }

  // TikTok-level failure
  if (data.error && data.error.code !== "ok") {
    throw new Error(
      `${data.error.code}: ${data.error.message}`
    );
  }

  return data;
};

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers // This is now automatically populated with the cookies
        });

        if (!session || !session.user) {
            throw { message: 'Unauthorized', status: 401 };
        }

        const { accessToken } = await auth.api.getAccessToken({
            body: { providerId: "tiktok" },
            headers: await headers() // Pass current request headers for session context
        });

        if (!accessToken) {
            throw { message: 'No access token found for TikTok', status: 403 };
        }

        const responseMetrics = await fetch(
        "https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const responseVideos = await fetch(
            "https://open.tiktokapis.com/v2/video/list/?fields=id,title,view_count,like_count,comment_count,share_count,create_time",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    max_count: 20
                }),
            }
        );

        if (!responseMetrics.ok || !responseVideos.ok) {
            throw { message: 'Failed to fetch metrics from TikTok', status: 500 };
        }

        const dataMetrics = await responseMetrics.json();
        const dataVideos = await responseVideos.json();

        const metrics = dataMetrics.data.user;
        const videos = dataVideos.data.videos;

        const views = videos.reduce((acc: number, video: any) => acc + video.view_count, 0);
        const likes = videos.reduce((acc: number, video: any) => acc + video.like_count, 0);
        const comments = videos.reduce((acc: number, video: any) => acc + video.comment_count, 0);
        const shares = videos.reduce((acc: number, video: any) => acc + video.share_count, 0);
        const avgEngagement = views > 0 ? (((likes + comments + shares) / views) * 100) : 0;

        const groupedByMonth = videos.reduce((acc: any, video: any) => {
            const rawTime = video.create_time;

            const date =
                typeof rawTime === "number"
                ? new Date(rawTime * 1000)
                : new Date(rawTime);

            const monthKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            if (date.getFullYear() === new Date().getFullYear()) {
                if (!acc[monthKey]) {
                    acc[monthKey] = {
                        views: 0,
                        engagement: 0,
                    };
                }

                const engagement =
                (video.like_count || 0) +
                (video.comment_count || 0) +
                (video.share_count || 0);

                acc[monthKey].views += video.view_count || 0;
                acc[monthKey].engagement += engagement;
            }

            return acc;
        }, {});

        const groupedByDay = videos.reduce((acc: any, video: any) => {
            const rawTime = video.create_time;

            const date =
                typeof rawTime === "number"
                ? new Date(rawTime * 1000)
                : new Date(rawTime);

            const day = date.getDay();

            if (!acc[day]) acc[day] = 0;

            const engagement =
                (video.like_count || 0) +
                (video.comment_count || 0) +
                (video.share_count || 0);

            acc[day] += engagement;

            return acc;
        }, {});

        const groupedByHour = videos.reduce((acc: any, video: any) => {
            const rawTime = video.create_time;

            const date =
                typeof rawTime === "number"
                ? new Date(rawTime * 1000)
                : new Date(rawTime);

            const hour = date.getHours(); // ✅ local time (0–23)

            if (!acc[hour]) acc[hour] = 0;

            const engagement =
                (video.like_count || 0) +
                (video.comment_count || 0) +
                (video.share_count || 0);

            acc[hour] += engagement;

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
        console.log("Videos:", videos);
        return Response.json({
            followers: formatNumber(metrics.follower_count),
            likes: formatNumber(metrics.likes_count),
            posts: formatNumber(metrics.video_count),
            views: formatNumber(views),
            avgEngagement: `${avgEngagement.toFixed(1)}%`,
            viewsHistory,
            engagementHistory,
            bestDay: getBestDay(groupedByDay),
            peakTime: getPeakTime(groupedByHour),
            topFormat: getTopFormat(videos),
        }, { status: 200 });
    } catch (error) {
        let err = error as { message: string, status: number }
        console.log("Error fetching posts:", error)
        return Response.json({ error: err.message ||'Failed to fetch posts' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { accessToken } = await auth.api.getAccessToken({
            body: { 
                providerId: "tiktok",
                userId: body.userId
            },
        });

        if (!accessToken) {
            throw { message: 'No access token found for TikTok', status: 403 };
        }

        const images = body.images || [];
        const imageUrls = images.map(
            (img: string) => `${process.env.NEXT_PUBLIC_APP_URL}/api/media?url=${encodeURIComponent(img)}`
        );

        const creatorInfoResponse = await fetch(
            "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const creatorInfo = handleTikTokResponse(creatorInfoResponse);

        const initResponse = await fetch(
            "https://open.tiktokapis.com/v2/post/publish/content/init/",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    post_info: {
                        description: body.caption || "",
                        privacy_level: "SELF_ONLY",
                        disable_comment: false,
                        auto_add_music: true,
                    },
                    source_info: {
                        source: "PULL_FROM_URL",
                        photo_images: imageUrls,
                        photo_cover_index: 0
                    },
                    post_mode: "DIRECT_POST",
                    media_type: "PHOTO",
                }),
            }
        );

        const initData = await handleTikTokResponse(initResponse);

        await qstashClient.publishJSON({
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/metrics/tiktok/status`,
            delay: 10,
            body: { 
                ...body,
                publish_id: initData.data.publish_id, 
                retryCount: 0 
            }
        })

        return Response.json({initData}, { status: 200 });
       
    } catch (error) {
        let err = error as { message: string, status: number }
        console.log("Error fetching posts:", error)
        return Response.json({ error: err.message ||'Failed to create post' }, { status: err.status || 500 })
    }
}