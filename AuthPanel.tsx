// AuthPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { isEmailAllowlisted } from "./allowlist";

function getPasswordStrength(pw: string) {
  const len = pw.length;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);

  let score = 0;
  if (len >= 8) score++;
  if (len >= 12) score++;
  if (hasLower) score++;
  if (hasUpper) score++;
  if (hasNumber) score++;
  if (hasSymbol) score++;

  if (pw.length === 0) return { label: "", detail: "" };
  if (score <= 2) return { label: "Weak", detail: "Add 8+ chars, upper/lower, number." };
  if (score <= 4) return { label: "Medium", detail: "Add uppercase, number, or symbol." };
  return { label: "Strong", detail: "Good password." };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function AuthPanel({
  onUserChange,
}: {
  onUserChange?: (user: User | null) => void;
}) {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // "chooser" hides form until user clicks Continue with Email
  const [showEmailForm, setShowEmailForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Email form message (keep as-is)
  const [msg, setMsg] = useState<string | null>(null);

  // ✅ Google-only message (NEW)
  const [googleMsg, setGoogleMsg] = useState<string | null>(null);

  // Forgot password UI
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      onUserChange?.(u);
    });
    return () => unsub();
  }, [onUserChange]);

  const strength = getPasswordStrength(password);
  const strengthClass =
    strength.label === "Weak"
      ? "text-red-600"
      : strength.label === "Medium"
      ? "text-amber-600"
      : "text-green-600";

  const signupStrongEnough = useMemo(() => {
    // your rule: block weak on signup
    return strength.label !== "Weak" && password.length >= 8;
  }, [strength.label, password.length]);

  const canSubmit = useMemo(() => {
    if (!email) return false;

    if (resetMode) {
      return isValidEmail(email);
    }

    if (!password) return false;

    if (password.length < 8) return false;

    if (mode === "signup") {
      if (!name.trim()) return false;
      if (!signupStrongEnough) return false; // block weak on signup
    }

    return true;
  }, [email, password, mode, name, resetMode, signupStrongEnough]);

  async function enforceAllowlistOrLogout(u: User) {
    const userEmail = (u.email || "").trim().toLowerCase();
    if (!userEmail) {
      await signOut(auth);
      throw new Error("Your account has no email attached. Access denied.");
    }

    const allowed = await isEmailAllowlisted(userEmail);
    if (!allowed) {
      await signOut(auth);
      throw new Error(
        "Access denied. Your email is not authorized for this platform. Please contact ASM staff."
      );
    }
  }

  async function loginGoogle() {
    // ✅ Google uses googleMsg only
    setGoogleMsg(null);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await enforceAllowlistOrLogout(cred.user);

      setResetMode(false);
      setResetSent(false);
      setShowEmailForm(false);
      setMsg(null); // clear email msg on successful Google login
    } catch (e: any) {
      const m = (e?.message || "").toString();
      if (m.includes("Access denied")) {
        setGoogleMsg("Hey Google account not authorized. Please contact ASM Center staff.");
      } else {
        setGoogleMsg(e?.message || "Google login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitEmailPassword(e: React.FormEvent) {
    e.preventDefault();

    // ✅ Email uses msg only
    setMsg(null);
    setGoogleMsg(null); // prevent Google message from ever showing during email flows
    setResetSent(false);

    if (resetMode) {
      // Forgot password flow
      const cleanEmail = email.trim().toLowerCase();
      if (!isValidEmail(cleanEmail)) {
        setMsg("Enter a valid email address.");
        return;
      }

      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        setResetSent(true);
        setMsg("A password reset link has been sent to your email. Check your inbox or spam if needed.");

        // Auto-switch back to Sign In
        setResetMode(false);
        setMode("signin");
        setPassword("");
      } catch (e: any) {
        setMsg(e?.message || "Failed to send reset email.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 8) {
      setMsg("Password must be at least 8 characters long.");
      return;
    }

    if (mode === "signup" && !signupStrongEnough) {
      setMsg("Signup blocked: password is too weak. Use a stronger password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });

        // Enforce allowlist immediately (otherwise anyone could create account)
        await enforceAllowlistOrLogout(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        await enforceAllowlistOrLogout(cred.user);
      }

      setResetMode(false);
      setResetSent(false);
    } catch (e: any) {
      const code = e?.code as string | undefined;

      if (code === "auth/email-already-in-use") setMsg("That email is already in use. Try signing in.");
      else if (code === "auth/invalid-credential") setMsg("Invalid email or password.");
      else if (code === "auth/invalid-email") setMsg("Invalid email address.");
      else if (code === "auth/weak-password") setMsg("Password must be at least 8 characters long.");
      else setMsg(e?.message || "Auth failed.");
    } finally {
      setLoading(false);
    }
  }

  async function logoutFirebase() {
    setMsg(null);
    setGoogleMsg(null);
    setLoading(true);
    try {
      await signOut(auth);
      setShowEmailForm(false);
      setResetMode(false);
      setResetSent(false);
      setPassword("");
    } catch (e: any) {
      setMsg(e?.message || "Logout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 -mt-4 mb-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        {!user ? (
          <>
            <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
              <div>
                <div className="text-sm font-semibold text-slate-900">Login required</div>
                <div className="text-xs text-slate-500">Use Google or email/password.</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={loginGoogle}
                  disabled={loading}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm((v) => !v);
                    setGoogleMsg(null); // ✅ don't keep Google message when switching to email UI
                  }}
                  disabled={loading}
                  className="bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-900 font-bold py-2 px-4 rounded-lg border border-slate-200"
                >
                  Continue with Email
                </button>
              </div>
            </div>

            {/* ✅ Google message ONLY shows here, and only when email form is closed */}
            {!showEmailForm && googleMsg && (
              <div className="mt-2 text-sm text-red-600">{googleMsg}</div>
            )}

            {showEmailForm && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setResetMode(false);
                      setResetSent(false);
                      setMsg(null);
                      setGoogleMsg(null);
                    }}
                    className={`text-sm font-semibold px-3 py-1 rounded-lg border ${
                      mode === "signin"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Sign in
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setResetMode(false);
                      setResetSent(false);
                      setMsg(null);
                      setGoogleMsg(null);
                    }}
                    className={`text-sm font-semibold px-3 py-1 rounded-lg border ${
                      mode === "signup"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Create account
                  </button>
                </div>

                <form onSubmit={submitEmailPassword} className="grid md:grid-cols-3 gap-3">
                  {mode === "signup" && !resetMode && (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                  )}

                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />

                  {!resetMode ? (
                    <div className="relative">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (min 8 chars)"
                        type={showPassword ? "text" : "password"}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full pr-20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  ) : (
                    <div className="md:col-span-2 text-sm text-slate-600 flex items-center">
                      Enter your email and we’ll send a reset link.
                    </div>
                  )}

                  {/* Strength only when Create account is selected (and not reset mode) */}
                  {mode === "signup" && !resetMode && strength.label && (
                    <div className="md:col-span-3 text-xs">
                      <span className={`font-bold ${strengthClass}`}>Strength: {strength.label}</span>
                      <span className="text-slate-500"> — {strength.detail}</span>
                    </div>
                  )}

                  <div className="md:col-span-3 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={!canSubmit || loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      {resetMode ? "Send reset link" : mode === "signup" ? "Create account" : "Sign in"}
                    </button>

                    {/* Forgot password button ONLY in Sign In mode */}
                    {mode === "signin" && !resetMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setResetMode(true);
                          setMsg(null);
                          setResetSent(false);
                          setPassword("");
                        }}
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Forgot password?
                      </button>
                    )}

                    {/* ✅ Email message stays here (as-is) */}
                    {msg && <span className="text-sm text-red-600">{msg}</span>}

                    {resetSent && !msg && (
                      <span className="text-sm text-green-700">
                        Reset link sent. Check inbox/spam.
                      </span>
                    )}
                  </div>

                  {/* Footer note only in Create Account section */}
                  {mode === "signup" && !resetMode && (
                    <div className="md:col-span-3 text-xs text-slate-500">
                      Password must be at least 8 characters. For signup, weak passwords are blocked.
                    </div>
                  )}
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="profile"
                  className="w-9 h-9 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-200" />
              )}

              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {user.displayName || "Logged in"}
                </div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
            </div>

            <button
              onClick={logoutFirebase}
              disabled={loading}
              className="text-sm font-semibold text-slate-600 hover:text-red-600 disabled:opacity-60"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

