import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getPlaceDetails(placeId) {
  const fields = [
    "name",
    "formatted_address",
    "rating",
    "user_ratings_total",
    "photos",
    "website",
    "opening_hours",
    "business_status",
    "url",
    "geometry"
  ].join(",");

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=${fields}` +
    `&key=${process.env.GOOGLE_PLACES_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK") throw new Error(`Places API: ${data.status}`);
  return data.result;
}

async function scrapeWebsite(websiteUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FranchiseReadinessBot/1.0; +https://ranchadvisors.com)"
      }
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();

    return {
      title:
        html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "",
      metaDesc:
        html.match(
          /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
        )?.[1]?.trim() ?? "",
      h1:
        html
          .match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
          ?.replace(/<[^>]+>/g, "")
          .trim() ?? "",
      h2s: [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
        .slice(0, 4)
        .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
        .filter(Boolean)
    };
  } catch {
    return null;
  }
}

function buildPrompt(place, site) {
  const reviewData = `${place.rating ?? "N/A"} stars, ${
    place.user_ratings_total ?? 0
  } reviews`;

  return `You are evaluating a business against Ranch Advisors' 5C Franchise Readiness Framework using only publicly available data.

BUSINESS:
- Name: ${place.name}
- Status: ${place.business_status ?? "unknown"}
- Reviews: ${reviewData}
- Website: ${place.website ? place.website : "none"}
- Hours on record: ${place.opening_hours ? "yes" : "no"}

WEBSITE SCAN:
- Title: ${site?.title || "N/A"}
- Meta description: ${site?.metaDesc || "N/A"}
- H1: ${site?.h1 || "N/A"}
- H2s: ${site?.h2s?.join(" / ") || "N/A"}

Score each C using ONLY the signals above. Commerce must always return "needs_conversation".

SCORING RULES:
- Context (market pull): strong = 50+ reviews AND rating >= 4.0 AND operational. developing = 15-49 reviews OR rating 3.5-3.9. weak = <15 reviews OR rating <3.5. unknown = no review data.
- Content (brand/positioning): strong = website with clear H1 + meta desc, coherent identity. developing = website present but generic. weak = no website or unreadable positioning.
- Community (customer base): strong = 50+ reviews with evident engagement. developing = 15-49 reviews. weak = <15 or stale reviews.
- Chemistry (operations): strong = consistent hours + structured website suggests repeatable process. developing = partial structure visible. weak = no apparent system.
- Commerce: always "needs_conversation".

Return ONLY valid JSON, no markdown:
{
  "overall": "Strong Foundation" | "Promising Early Stage" | "Needs Work" | "Incomplete Data",
  "overall_note": "One honest sentence, max 18 words.",
  "scores": {
    "context":   { "level": "strong"|"developing"|"weak"|"unknown",      "finding": "One sentence max 16 words citing actual numbers." },
    "content":   { "level": "strong"|"developing"|"weak"|"unknown",      "finding": "One sentence max 16 words." },
    "community": { "level": "strong"|"developing"|"weak"|"unknown",      "finding": "One sentence max 16 words." },
    "chemistry": { "level": "strong"|"developing"|"weak"|"unknown",      "finding": "One sentence max 16 words." },
    "commerce":  { "level": "needs_conversation", "finding": "Unit economics can't be read from a Google listing — this one needs a real conversation." }
  }
}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { place_id } = req.body ?? {};
  if (!place_id) return res.status(400).json({ error: "place_id is required" });

  try {
    const place = await getPlaceDetails(place_id);
    const site = place.website ? await scrapeWebsite(place.website) : null;

    const llmRes = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 600,
      messages: [{ role: "user", content: buildPrompt(place, site) }]
    });

    const signal = JSON.parse(llmRes.content[0].text);
    const photoRef = place.photos?.[0]?.photo_reference ?? null;

    return res.status(200).json({
      business: {
        name: place.name,
        address: place.formatted_address,
        rating: place.rating ?? null,
        review_count: place.user_ratings_total ?? 0,
        website: place.website ?? null,
        google_maps_url: place.url ?? null,
        photo_ref: photoRef,
        lat: place.geometry?.location?.lat ?? null,
        lng: place.geometry?.location?.lng ?? null,
        status: place.business_status ?? null
      },
      signal
    });
  } catch (err) {
    console.error("[analyze]", err);
    return res.status(500).json({ error: "Analysis failed", message: err.message });
  }
}
