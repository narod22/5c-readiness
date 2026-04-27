// Proxies Google Places photos so the API key stays server-side.
// Usage: GET /api/photo?ref={photo_reference}&maxwidth=800

export default async function handler(req, res) {
  const { ref, maxwidth = "800" } = req.query;
  if (!ref) return res.status(400).json({ error: "ref required" });

  const url =
    `https://maps.googleapis.com/maps/api/place/photo` +
    `?maxwidth=${maxwidth}` +
    `&photoreference=${encodeURIComponent(ref)}` +
    `&key=${process.env.GOOGLE_PLACES_API_KEY}`;

  try {
    const googleRes = await fetch(url);
    if (!googleRes.ok) return res.status(502).json({ error: "Photo unavailable" });

    const contentType = googleRes.headers.get("content-type") || "image/jpeg";
    const buffer = await googleRes.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error("[photo]", err);
    return res.status(500).json({ error: "Photo fetch failed" });
  }
}
