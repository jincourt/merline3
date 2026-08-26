import { createHash, randomInt } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const OTP_TTL_MS = 10 * 60 * 1000;

function otpSecret() {
  return process.env.OTP_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

export function generateOtpCode() {
  return String(randomInt(100000, 999999));
}

export function hashOtpCode(email: string, code: string) {
  return createHash("sha256")
    .update(`${email.toLowerCase()}:${code}:${otpSecret()}`)
    .digest("hex");
}

export async function storeOtpCode(email: string, code: string) {
  const admin = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  await admin.from("email_otp_codes").delete().eq("email", normalizedEmail);

  const { error } = await admin.from("email_otp_codes").insert({
    email: normalizedEmail,
    code_hash: hashOtpCode(normalizedEmail, code),
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error("Impossible d'enregistrer le code.");
  }
}

export async function verifyOtpCode(email: string, code: string) {
  const admin = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const codeHash = hashOtpCode(normalizedEmail, code);

  const { data, error } = await admin
    .from("email_otp_codes")
    .select("id, expires_at")
    .eq("email", normalizedEmail)
    .eq("code_hash", codeHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    await admin.from("email_otp_codes").delete().eq("id", data.id);
    return false;
  }

  await admin.from("email_otp_codes").delete().eq("email", normalizedEmail);
  return true;
}

export async function sendOtpEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY manquant.");
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "Merline <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Votre code Merline",
    html: `
      <p style="font-family:sans-serif;font-size:15px;color:#0a0a0a;">
        Votre code de connexion Merline :
      </p>
      <p style="font-family:monospace;font-size:28px;font-weight:600;letter-spacing:0.2em;color:#4f46e5;">
        ${code}
      </p>
      <p style="font-family:sans-serif;font-size:13px;color:#52525b;">
        Ce code expire dans 10 minutes. Si vous n'avez pas demandé ce code, ignorez cet email.
      </p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
