// app/api/trending-posts/route.ts
export const runtime = 'nodejs';

import { ApifyClient } from 'apify-client';
import { GoogleGenAI } from '@google/genai';

// ---------------- ENV ----------------
const apify = new ApifyClient();

// ---------------- AI → Topic URLs ----------------
async function getTopicUrls(interests: string[] = []): Promise<string[]> {
  // fallback: all topics
  if (!interests.length) {
    return [
      'https://www.instagram.com/explore/topics/10155868806390727/sports/',
      'https://www.instagram.com/explore/topics/10155994924430727/music-audio/',
      'https://www.instagram.com/explore/topics/10156104410190727/fashion-beauty/',
      'https://www.instagram.com/explore/topics/10155994923880727/tv-movies/',
      'https://www.instagram.com/explore/topics/10156104417160727/games/',
      'https://www.instagram.com/explore/topics/514454113372737/pop-culture/',
    ];
  }

  const prompt = `
You are a precise classification engine that maps user interests to predefined Instagram topic URLs.

Your goal is to select the MOST relevant topics based on semantic meaning.

---

AVAILABLE TOPICS:

1. Sports
   https://www.instagram.com/explore/topics/10155868806390727/sports/
   Includes: fitness, gym, running, football, basketball, workouts, athletics

2. Music
   https://www.instagram.com/explore/topics/10155994924430727/music-audio/
   Includes: songs, singing, DJ, beats, audio, concerts, instruments

3. Fashion & Beauty
   https://www.instagram.com/explore/topics/10156104410190727/fashion-beauty/
   Includes: outfits, clothing, style, makeup, skincare, modeling

4. TV & Movies
   https://www.instagram.com/explore/topics/10155994923880727/tv-movies/
   Includes: films, cinema, Netflix, series, actors, shows

5. Games
   https://www.instagram.com/explore/topics/10156104417160727/games/
   Includes: gaming, esports, streamers, video games, consoles

6. Pop Culture
   https://www.instagram.com/explore/topics/514454113372737/pop-culture/
   Includes: trends, memes, internet culture, influencers, technology, startups, AI, general lifestyle

---

INPUT:
${JSON.stringify(interests)}

---

STRICT DECISION RULES:

1. Always choose the MINIMUM number of topics needed
   * Prefer 1 topic if possible
   * Use 2 ONLY if interests clearly belong to different categories
   * Use 3 ONLY in rare cases

2. If multiple interests strongly match ONE category → return ONLY that category

3. If interests are vague, modern, or tech-related (AI, startups, apps, social media) → choose Pop Culture

4. Do NOT guess niche mappings
   * Example: "AI" is NOT "Games" → use Pop Culture

5. Avoid over-classification
   * Do NOT include loosely related topics

6. If no strong match → default to Pop Culture

---

OUTPUT FORMAT (STRICT JSON ONLY, NO TEXT):

{
"directUrls": [
"https://www.instagram.com/explore/topics/XXXX/"
]
}

---

EXAMPLES:

Input:
["ai", "technology", "startups"]

Output:
{
"directUrls": [
"https://www.instagram.com/explore/topics/514454113372737/pop-culture/"
]
}

Input:
["gym", "fitness", "workout"]

Output:
{
"directUrls": [
"https://www.instagram.com/explore/topics/10155868806390727/sports/"
]
}

Input:
["gaming", "streaming"]

Output:
{
"directUrls": [
"https://www.instagram.com/explore/topics/10156104417160727/games/"
]
}

Input:
["movies", "netflix", "cinema"]

Output:
{
"directUrls": [
"https://www.instagram.com/explore/topics/10155994923880727/tv-movies/"
]
}

Input:
["music", "dj", "concert"]

Output:
{
"directUrls": [
"https://www.instagram.com/explore/topics/10155994924430727/music-audio/"
]
}

Input:
["fashion", "outfit", "skincare"]

Output:
{
"directUrls": [
"https://www.instagram.com/explore/topics/10156104410190727/fashion-beauty/"
]
}

Input:
["gaming", "movies"]

Output:
{
"directUrls": [
"https://www.instagram.com/explore/topics/10156104417160727/games/",
"https://www.instagram.com/explore/topics/10155994923880727/tv-movies/"
]
}
`;

  const ai = new GoogleGenAI();

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview',
    contents: prompt,
  });

  const text = response.text?.trim() || '';

  try {
    const parsed = JSON.parse(text);
    return parsed.directUrls || [];
  } catch {
    return ['https://www.instagram.com/explore/topics/514454113372737/pop-culture/'];
  }
}

// ---------------- API ROUTE ----------------
export async function POST(req: Request) {
  try {
    const { interests }: { interests?: string[] } = await req.json();

    // 1️⃣ AI → topic URLs
    const urls = await getTopicUrls(interests || []);

    // 2️⃣ Apify → scrape trending posts
    const run = await apify.actor('apify/instagram-topic-scraper').call({
      directUrls: urls,
      resultsLimit: 1,
      depthOfSubtopics: 1,
    });

    const { items } = await apify.dataset(run.defaultDatasetId).listItems();

    // 3️⃣ Map to frontend-ready structure
    const trendingPosts = items.map((item: any) => ({
      caption: item.caption,
      ownerFullName: item.ownerFullName,
      ownerUsername: item.ownerUsername,
      url: item.url,
      commentsCount: item.commentsCount,
      likesCount: item.likesCount,
      timestamp: item.timestamp,
      shortCode: item.shortCode,
      displayUrl: item.displayUrl,
    }));

    return Response.json(trendingPosts);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch trending posts' }, { status: 500 });
  }
}
