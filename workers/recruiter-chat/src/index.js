const MAX_JD_CHARS = 12_000;
const MAX_QUESTION_CHARS = 2_000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const hitsByIp = new Map();

const PROFILE = `
Name: Vasu Bansal
Current role: MTS-3 at Nutanix
Experience: 5+ years backend and infrastructure
Previous companies: Gojek, Deloitte
Education: IIT Kanpur, B.Tech Mechanical Engineering + second major in Aerospace Engineering (2016–2021)
Primary stack: Go, Spring Boot, Ruby on Rails, Kafka, Postgres, Kubernetes, Helm, Envoy, ELK, OIDC
Work focus: microservices, backend platforms, infra, control-plane migrations (Helm, Envoy, OIDC)
Open to: Backend, Infra, Data Engineering, or AI-adjacent roles (AI still learning)
Location: India
Email: vasubansal1998@gmail.com
LinkedIn: https://www.linkedin.com/in/vasub-iitk/
GitHub: https://github.com/vasubansal1033
Resume: https://vasubansal1033.github.io/resume.pdf
Booking: Google Calendar appointment schedule on https://vasubansal1033.github.io/recruiter/
Side interests: systems internals (Go memory, Redis, databases, distributed systems), Deep Learning (LLMs, diffusion), homelab/self-hosting
Do not invent metrics, SLAs, team sizes, dates, or impact numbers that are not listed above.
`.trim();

const SYSTEM = `You are a recruiter assistant for Vasu Bansal. Answer only from the PROFILE facts below. If the recruiter pastes a job description, map the listed skills and experience to the JD in plain language. If something is unknown, say it is not in the profile. Never invent employers, titles, years, or numbers. Keep answers under 180 words. Be direct and useful to a recruiter on a 30-second screen.

PROFILE:
${PROFILE}`;

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (origin && allowed.includes(origin)) return origin;
  return allowed[0] || "";
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(origin, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function clientIp(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hitsByIp.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hitsByIp.set(ip, recent);
    return true;
  }
  recent.push(now);
  hitsByIp.set(ip, recent);
  return false;
}

async function askGemini(env, userText) {
  const model = env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(env.LLM_API_KEY)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`gemini ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map(p => p.text)
    .filter(Boolean)
    .join("\n")
    .trim();
  if (!text) throw new Error("empty model response");
  return text;
}

export default {
  async fetch(request, env) {
    const origin = allowedOrigin(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return json(origin, { error: "POST only" }, 405);
    }

    const incoming = request.headers.get("Origin") || "";
    const allowed = String(env.ALLOWED_ORIGINS || "")
      .split(",")
      .map(s => s.trim());
    if (incoming && !allowed.includes(incoming)) {
      return json(origin, { error: "origin not allowed" }, 403);
    }

    if (!env.LLM_API_KEY) {
      return json(origin, { error: "proxy not configured" }, 503);
    }

    const ip = clientIp(request);
    if (rateLimited(ip)) {
      return json(origin, { error: "rate limit" }, 429);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(origin, { error: "invalid json" }, 400);
    }

    const question = String(payload?.question || "").trim();
    const jd = String(payload?.jd || "").trim();
    if (!question) return json(origin, { error: "question required" }, 400);
    if (question.length > MAX_QUESTION_CHARS) {
      return json(origin, { error: "question too long" }, 400);
    }
    if (jd.length > MAX_JD_CHARS) {
      return json(origin, { error: "jd too long" }, 400);
    }

    const userText = jd
      ? `JOB DESCRIPTION:\n${jd}\n\nRECRUITER QUESTION:\n${question}`
      : question;

    try {
      const answer = await askGemini(env, userText);
      return json(origin, { answer });
    } catch (err) {
      return json(origin, { error: "model failed" }, 502);
    }
  },
};
