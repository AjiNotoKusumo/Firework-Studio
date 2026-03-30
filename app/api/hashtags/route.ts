// app/api/hashtags/route.ts
export const runtime = 'nodejs';

import { ApifyClient } from 'apify-client';

const apify = new ApifyClient();

// ---------------- Parse "9.27 m" / "339.08 k" → number ----------------
function parseCount(info: string): number {
  if (!info || info === '—') return 0;
  const clean = info.trim().toLowerCase();
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (clean.endsWith('m')) return Math.round(num * 1_000_000);
  if (clean.endsWith('k')) return Math.round(num * 1_000);
  return Math.round(num);
}

// ---------------- Default seeds ----------------
const DEFAULT_SEEDS = ['ai', 'technology', 'innovation', 'startup', 'science'];

// ---------------- API ROUTE ----------------
export async function POST(req: Request) {
  try {
    const { interests }: { interests?: string[] } = await req.json();

    // Use interests as seeds if provided, otherwise fall back to defaults
    const seedHashtags = interests && interests.length > 0 ? interests : DEFAULT_SEEDS;

    // ✅ One call per seed, in parallel, using instagram-search-scraper
    const runs = await Promise.all(
      seedHashtags.map((tag) =>
        apify.actor('apify/instagram-search-scraper').call({
          enhanceUserSearchWithFacebookPage: false,
          search: tag,
          searchType: 'hashtag',
          searchLimit: 1,
        }),
      ),
    );

    // Fetch all datasets in parallel
    const datasets = await Promise.all(runs.map((run) => apify.dataset(run.defaultDatasetId).listItems()));

    // Extract relatedFrequent hashtags with real post counts
    const seen = new Set<string>();
    const hashtags: { name: string; value: number }[] = [];

    for (const { items } of datasets) {
      for (const item of items as any[]) {
        // Primary: relatedFrequent has real post counts e.g. "51.87 m"
        const related: { hash: string; info: string }[] = item.relatedFrequent || [];

        for (const tag of related) {
          const name = tag.hash.replace(/^#/, '').trim().toLowerCase();
          const value = parseCount(tag.info);
          if (!seen.has(name) && value > 0) {
            seen.add(name);
            hashtags.push({ name, value });
          }
        }

        // Fallback: use the item itself if relatedFrequent is empty
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
    return Response.json({ hashtags: result });
  } catch (err) {
    console.error('[hashtags] Error:', err);
    return Response.json({ hashtags: [] }, { status: 200 });
  }
}
