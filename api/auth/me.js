import { jwtVerify } from "jose";

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").map(v => v.trim()).filter(Boolean).forEach(p => {
    const i = p.indexOf("=");
    if (i > -1) out[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1));
  });
  return out;
}

export default async function handler(req, res) {
  if (!process.env.AUTH_SECRET) return res.status(500).json({ error: "Missing AUTH_SECRET" });

  const cookies = parseCookies(req);
  const token = cookies.session;

  if (!token) return res.status(200).json({ user: null });

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    return res.status(200).json({ user: payload.user || null });
  } catch {
    return res.status(200).json({ user: null });
  }
}
