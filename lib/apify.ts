import { ApifyClient } from 'apify-client';

const apify = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

export async function getInstagramTrending(urls: string[]) {
    const run = await apify.actor('apify/instagram-topic-scraper').call({
      directUrls: urls,
      resultsLimit: 1,
      depthOfSubtopics: 1,
    });

    const { items } = await apify.dataset(run.defaultDatasetId).listItems();
    return items;
}

export async function getInstagramHashtag(interests: string[]) {
    const DEFAULT_SEEDS = ['ai', 'technology', 'innovation', 'startup', 'science'];

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

    return datasets;
}