import fetch from 'node-fetch';

export const IG_BASE = 'https://graph.facebook.com/v17.0';

export async function getInstagramMetrics(accessToken: string, igUserId: string) {
  const res = await fetch(
    `${IG_BASE}/${igUserId}?fields=username,followers_count,media_count&access_token=${accessToken}`,
  );
  return res.json();
}

export async function postInstagramImage(accessToken: string, igUserId: string, imageUrl: string, caption: string) {
  // Step 1: Create media container
  const createRes = await fetch(`${IG_BASE}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: accessToken }),
  });
  const { id: containerId } = await createRes.json();

  // Step 2: Publish container
  const publishRes = await fetch(`${IG_BASE}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: containerId, access_token: accessToken }),
  });

  return publishRes.json();
}
