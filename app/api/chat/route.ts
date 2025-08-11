import { NextRequest } from "next/server";

export const runtime = "nodejs"; // ensures Node runtime for streaming

const PROTO_SYSTEM = `
You are Proto, an AI assistant that crafts detailed, ready-to-copy prompt templates
for product mockups and model renders (clothing + ANY product).
Ask 1–2 clarifying questions if needed, then return 3–5 high-quality prompt options,
formatted cleanly for image generators. Keep it concise, commercial, and on-brand.
`;

export async function POST(req: NextRequest) {
  const { userMessage } = await req.json();

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: PROTO_SYSTEM },
        { role: "user", content: userMessage ?? "" }
      ],
    }),
  });

  if (!r.ok || !r.body) {
    const text = await r.text().catch(() => "");
    return new Response(text || "Upstream error", { status: 500 });
  }

  // stream OpenAI response back to the browser
  return new Response(r.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}