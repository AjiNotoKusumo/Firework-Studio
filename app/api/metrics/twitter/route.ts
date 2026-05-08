import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMediaId } from '@/lib/twitter';
import PostModel from "@/lib/models/PostModel";

type Tweet = {
  created_at: string;
  public_metrics: {
    like_count: number;
    impression_count: number;
    reply_count?: number;
    retweet_count?: number;
    quote_count?: number;
    bookmark_count?: number;
  };
  attachments?: {
    media_keys?: string[];
  };
};

type HistoryPoint = {
  name: string;
  value: number;
};

type TwitterAnalytics = {
  followers: string;
  followersChange: string;
  likes: string;
  likesChange: string;
  posts: string;
  postsChange: string;
  views: string;
  viewsChange: string;
  engagementHistory: HistoryPoint[];
  viewsHistory: HistoryPoint[];
};

type GrowthSummary = {
  bestDay: string;
  peakTime: string;
  avgEngagement: string;
  topFormat: string;
};

/* ===================== HELPERS ===================== */
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

const fakeChange = (prefix: string): string => {
  const value = (Math.random() * 10 + 2).toFixed(1);
  return `+${value}% ${prefix}`;
};

const buildEngagementHistory = (
  groupedByMonth: any,
): HistoryPoint[] => {
  const baseMonths = generateMonths(new Date().getFullYear());

  const engagementHistory = baseMonths.map((month) => {
    const existing = groupedByMonth[month.key];

    return {
      name: month.label,
      value: existing ? existing.engagement : 0,
    };
  });
  return engagementHistory;
};

const buildViewsHistory = (groupedByMonth: any): HistoryPoint[] => {
  const baseMonths = generateMonths(new Date().getFullYear());

  const viewsHistory = baseMonths.map((month) => {
    const existing = groupedByMonth[month.key];

    return {
      name: month.label,
      value: existing ? existing.views : 0,
    };
  });
  return viewsHistory;
};

const getBestDay = (tweets: Tweet[]): string => {
  const map = new Map<string, { total: number; count: number }>();

  tweets.forEach((t) => {
    const date = new Date(t.created_at);
    const day = date.toLocaleString("en-US", { weekday: "long" });

    const engagement =
      (t.public_metrics.like_count + (t.public_metrics.reply_count || 0)) /
      Math.max(t.public_metrics.impression_count, 1);

    const current = map.get(day) ?? { total: 0, count: 0 };

    map.set(day, {
      total: current.total + engagement,
      count: current.count + 1,
    });
  });

  let bestDay = "N/A";
  let bestScore = 0;

  map.forEach((val, key) => {
    const avg = val.total / val.count;
    if (avg > bestScore) {
      bestScore = avg;
      bestDay = key;
    }
  });

  return bestDay;
};

const getPeakTime = (tweets: Tweet[]): string => {
  const hours = new Array<number>(24).fill(0);

  tweets.forEach((t) => {
    const date = new Date(t.created_at);
    const hour = date.getHours();

    const engagement =
      (t.public_metrics.like_count + (t.public_metrics.reply_count || 0)) /
      Math.max(t.public_metrics.impression_count, 1);

    hours[hour] += engagement;
  });

  const bestHour = hours.indexOf(Math.max(...hours));
  return `${bestHour}:00 - ${bestHour + 2}:00`;
};

const getEngagementRate = (tweets: Tweet[]): string => {
  let totalEngagement = 0;
  let totalImpressions = 0;

  tweets.forEach((t) => {
    totalEngagement +=
      t.public_metrics.like_count +
      (t.public_metrics.reply_count || 0) +
      (t.public_metrics.retweet_count || 0) +
      (t.public_metrics.quote_count || 0) +
      (t.public_metrics.bookmark_count || 0);

    totalImpressions += t.public_metrics.impression_count || 0;
  });

  const rate =
    totalImpressions > 0
      ? (totalEngagement / totalImpressions) * 100
      : 0;

  return `${rate.toFixed(1)}%`;
};

const getTopTweet = (tweets: Tweet[]) : string => {
  if (!tweets.length) return `-`;

  const maxEngagement = tweets
    .map((t) => {
      const metrics = t.public_metrics;

      const engagement =
        (metrics.like_count || 0) +
        (metrics.reply_count || 0) +
        (metrics.retweet_count || 0) +
        (metrics.quote_count || 0) +
        (metrics.bookmark_count || 0);

      return {
        engagement,
        createdAt: t.created_at,
      };
    })
    .sort((a, b) => b.engagement - a.engagement)[0].engagement

  return `${maxEngagement} Engagement`;
};

const buildGrowthSummary = (tweets: Tweet[]): GrowthSummary => {
  return {
    bestDay: getBestDay(tweets),
    peakTime: getPeakTime(tweets),
    avgEngagement: getEngagementRate(tweets),
    topFormat: getTopTweet(tweets),
  };
};

const aggregate = (tweets: Tweet[]) => {
  let likes = 0;
  let views = 0;

  for (const t of tweets) {
    likes += t.public_metrics.like_count || 0;
    views += t.public_metrics.impression_count || 0;
  }

  return { likes, views, posts: tweets.length };
};

const buildTwitterAnalytics = (
  tweets: Tweet[],
  followers: number,
  totalPosts: number
): TwitterAnalytics => {
  const { likes, views } = aggregate(tweets);

  const groupedByMonth = tweets.reduce((acc: any, t) => {
    const date = new Date(t.created_at);

    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (date.getFullYear() === new Date().getFullYear()) {
      if (!acc[monthKey]) {
        acc[monthKey] = {
          views: 0,
          engagement: 0
        };
      }

      acc[monthKey].views += t.public_metrics.impression_count || 0;
      acc[monthKey].engagement +=
        (t.public_metrics.like_count || 0) +
        (t.public_metrics.reply_count || 0) +
        (t.public_metrics.retweet_count || 0) +
        (t.public_metrics.quote_count || 0) +
        (t.public_metrics.bookmark_count || 0);
    }

    return acc;
  }, {});

  return {
    followers: formatNumber(followers),
    followersChange: fakeChange("from last month"),

    likes: formatNumber(likes),
    likesChange: fakeChange("from last week"),

    posts: formatNumber(totalPosts),
    postsChange: `+${Math.floor(Math.random() * 20)} this week`,

    views: formatNumber(views),
    viewsChange: fakeChange("from last month"),

    engagementHistory: buildEngagementHistory(groupedByMonth),
    viewsHistory: buildViewsHistory(groupedByMonth),
  };
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
        body: { providerId: "twitter" },
        headers: await headers() // Pass current request headers for session context
    });

    if (!accessToken) {
        throw { message: 'No access token found for Twitter', status: 403 };
    }

    const responseProfile = await fetch(
        "https://api.x.com/2/users/me?user.fields=public_metrics",
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`, // The token from Better Auth
            },
        }
    );

    const resultProfile = await responseProfile.json();

    const userId = resultProfile.data?.id;

    if (!userId) {
        throw { message: 'Failed to retrieve user ID from Twitter profile', status: 500 };
    }

    const responsePost = await fetch(
        `https://api.x.com/2/users/${userId}/tweets?max_results=100&tweet.fields=created_at,public_metrics,organic_metrics,attachments&expansions=attachments.media_keys&media.fields=type`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`, // The token from Better Auth
            },
        }
    );

    
    const resultPost = await responsePost.json();

    if (!responseProfile.ok || !responsePost.ok) {
        const errorResponse = !responseProfile.ok ? responseProfile : responsePost;
        const errorResult = !responseProfile.ok ? resultProfile : resultPost;
        console.log("Twitter API error:", await errorResponse.text());
        const errorMessage = errorResult.detail || errorResult.errors?.[0]?.message || 'Unknown Twitter Error';
        throw { message: errorMessage, status: errorResponse.status };
    }

    /* ===== BUILD ANALYTICS ===== */
    const tweets: Tweet[] = resultPost.data ?? [];

    const analytics = buildTwitterAnalytics(
      tweets,
      resultProfile.data.public_metrics.followers_count,
      resultProfile.data.public_metrics.tweet_count
    );

    const growth = buildGrowthSummary(tweets);
    
    console.log(resultPost.data);
    
    return NextResponse.json( { ...analytics, ...growth } );
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
                providerId: "twitter",
                userId: body.userId
            },
        });

        if (!accessToken) {
            throw { message: 'No access token found for Twitter', status: 403 };
        }

        const images = body.images || [];

        const mediaIds = images.length > 0 ? await Promise.all(images.map((url: string) => getMediaId(url, accessToken))) : [];

        console.log("Media IDs obtained from Twitter:", mediaIds);

        const payload : any = { 
            text: body.caption,
        };

        if (mediaIds.length > 0) {
            payload["media"] = { media_ids: mediaIds };
        }

        const response = await fetch("https://api.x.com/2/tweets", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            console.log("Twitter API error:", await response.text());
            const errorMessage = result.detail || result.errors?.[0]?.message || 'Unknown Twitter Error';
            throw { message: errorMessage, status: response.status };
        }

        await PostModel.updatePost(body.postId, {
            ...body,
            status: "published",
            qstashId: null,
            twitterId: result.data.id,
        })

        return NextResponse.json(result.data);
    } catch (error) {
        let err = error as { message: string, status: number }
        console.log("Error fetching posts:", error)
        return Response.json({ error: err.message ||'Failed to create post' }, { status: err.status || 500 })
    }
}