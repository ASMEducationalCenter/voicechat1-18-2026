// allowlist.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Returns true if the user is allowlisted in Firestore.
 * Firestore path: /allowlist/<email>
 * Example doc id: "bob@gmail.com"
 */
export async function isEmailAllowlisted(email: string): Promise<boolean> {
  const emailNormalized = email.trim().toLowerCase();
  const ref = doc(db, "allowlist", emailNormalized);
  const snap = await getDoc(ref);

  // If doc exists, allow
  if (!snap.exists()) return false;

  // Optional: require enabled=true if you want disable toggles
  const data = snap.data() as { enabled?: boolean } | undefined;
  if (typeof data?.enabled === "boolean") return data.enabled;

  // If no enabled field, treat existence as allow
  return true;
}

