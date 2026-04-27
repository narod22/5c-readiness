import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, business_name, place_id } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "email required" });

  const { error } = await supabase
    .from("readiness_leads")
    .insert({ name, email, business_name, place_id, source: "5c-grader" });

  if (error) {
    console.error("[capture-lead]", error);
    return res.status(500).json({ error: "Failed to save lead" });
  }

  return res.status(200).json({ ok: true });
}
