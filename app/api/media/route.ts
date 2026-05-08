export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new Response("Missing URL", { status: 400 });
  }

  const response = await fetch(imageUrl);

  return new Response(response.body, {
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") || "image/jpeg",
    },
  });
}