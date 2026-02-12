import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { getPool } from "../_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  if (!process.env.AUTH_SECRET) return res.status(500).json({ error: "Missing AUTH_SECRET" });

  const normalizedEmail = String(email).trim().toLowerCase();
  const pool = getPool();

  // ✅ Allowlist check (only approved emails can log in)
  const allow = await pool.query(`select 1 from allowed_users where email = $1`, [normalizedEmail]);
  if (allow.rowCount === 0) {
    return res.status(403).json({ error: "This email is not authorized. Please contact ASM staff." });
  }

  const { rows } = await pool.query(
    `select id, email, password_hash from users where email = $1`,
    [normalizedEmail]
  );

  const userRow = rows[0];
  if (!userRow) return res.status(401).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, userRow.password_hash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const token = await new SignJWT({ user: { id: userRow.id, email: userRow.email } })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(process.env.AUTH_SECRET));

  res.setHeader(
    "Set-Cookie",
    `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  );

  return res.status(200).json({ ok: true });
}
