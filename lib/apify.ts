import { ApifyClient } from 'apify-client';
import fetch from 'node-fetch';

interface TwitterTrendingInput {
  maxItems: number;
  searchTerms: string[];
  sort?: 'Latest' | 'Top';
  tweetLanguage?: string;
}

const apify = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

export async function getInstagramTrending(urls: string[]) {
  const run = await apify.actor('apify/instagram-topic-scraper').call({
    directUrls: urls,
    resultsLimit: 50,
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

export async function getTwitterTrending(input: TwitterTrendingInput) {
  const { maxItems, searchTerms, sort = 'Latest', tweetLanguage = 'en' } = input;

  // Build request payload for Apidojo / Tweet Scraper
  const payload = {
    maxItems,
    searchTerms,
    sort,
    tweetLanguage,
  };

  try {
    const res = await apify.actor('apidojo/tweet-scraper').call(payload);

    const { items } = await apify.dataset(res.defaultDatasetId).listItems();

    console.log('Fetched trending tweets:', items[0]);

    // Map raw API tweets into simplified structure
    return items.map((tweet: any) => ({
      id: tweet.id_str || tweet.id,
      text: tweet.text,
      fullText: tweet.fullText || tweet.text,
      username: tweet.author?.userName || tweet.username,
      fullName: tweet.author?.name || tweet.fullName,
      profilePicture: tweet.author?.profilePicture || tweet.profilePicture,
      media:
        tweet.extendedEntities?.media?.length ? tweet.extendedEntities.media.map((m: any) => m.media_url_https) : [],
      timestamp: tweet.createdAt,
      likesCount: tweet.favorite_count || tweet.likeCount || 0,
      retweetsCount: tweet.retweet_count || tweet.retweetCount || 0,
      repliesCount: tweet.reply_count || tweet.replyCount || 0,
    }));
  } catch (err) {
    console.error('Failed to fetch Twitter trending:', err);
    return [];
  }
}
