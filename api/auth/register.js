import bcrypt from "bcryptjs";
import { getPool } from "../_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  if (password.length < 8) return res.status(400).json({ error: "password must be at least 8 characters" });

  const normalizedEmail = String(email).trim().toLowerCase();
  const pool = getPool();

  // ✅ Allowlist check (only approved emails can register)
  const allow = await pool.query(`select 1 from allowed_users where email = $1`, [normalizedEmail]);
  if (allow.rowCount === 0) {
    return res.status(403).json({ error: "This email is not authorized. Please contact ASM staff." });
  }

  const password_hash = await bcrypt.hash(password, 12);

  try {
    const { rows } = await pool.query(
      `insert into users (email, password_hash)
       values ($1, $2)
       returning id, email, created_at`,
      [normalizedEmail, password_hash]
    );
    return res.status(200).json({ user: rows[0] });
  } catch {
    return res.status(400).json({ error: "email already exists" });
  }
}
