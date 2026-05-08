export const runtime = 'nodejs';

import { getInstagramHashtag } from '@/lib/apify';
import { auth } from '@/lib/auth';
import redis from '@/lib/redis';

function parseCount(info: string): number {
  if (!info || info === '—') return 0;
  const clean = info.trim().toLowerCase();
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (clean.endsWith('m')) return Math.round(num * 1_000_000);
  if (clean.endsWith('k')) return Math.round(num * 1_000);
  return Math.round(num);
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) throw { message: 'Unauthorized', status: 401 };

    const cacheKey = `instagram_hashtags_${session.user.id}`;
    const cached = await redis.get(cacheKey);
    if (cached) return Response.json(JSON.parse(cached));

    const interests = session.user.interests || [];
    const datasets = await getInstagramHashtag(interests);

    const seen = new Set<string>();
    const hashtags: { name: string; value: number }[] = [];

    for (const { items } of datasets) {
      for (const item of items as any[]) {
        const related: { hash: string; info: string }[] = item.relatedFrequent || [];
        for (const tag of related) {
          const name = tag.hash.replace(/^#/, '').trim().toLowerCase();
          const value = parseCount(tag.info);
          if (!seen.has(name) && value > 0) {
            seen.add(name);
            hashtags.push({ name, value });
          }
        }
        if (!related.length && item.name && item.postsCount) {
          const name = String(item.name).replace(/^#/, '').trim().toLowerCase();
          const value = typeof item.postsCount === 'string' ? parseCount(item.postsCount) : Number(item.postsCount);
          if (!seen.has(name) && value > 0) {
            seen.add(name);
            hashtags.push({ name, value });
          }
        }
      }
    }

    const result = hashtags.sort((a, b) => b.value - a.value).slice(0, 10);

    await redis.set(cacheKey, JSON.stringify({ hashtags: result }), 'EX', 60 * 60 * 24);

    return Response.json({ hashtags: result });
  } catch (err) {
    console.error('[hashtags] Error:', err);

    // Optional fallback
    // const cached = await redis.get(`instagram_hashtags_${session.user.id}`);
    // if (cached) return Response.json(JSON.parse(cached));

    return Response.json({ hashtags: [] }, { status: 200 });
  }
}
