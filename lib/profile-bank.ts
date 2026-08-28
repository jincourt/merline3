export type BankAccount = {
  accountName: string;
  iban: string;
  bic: string;
  bankName: string;
};

export const EMPTY_BANK_ACCOUNT: BankAccount = {
  accountName: "",
  iban: "",
  bic: "",
  bankName: "",
};

export function hasBankAccount(bank: BankAccount): boolean {
  return Boolean(
    bank.accountName.trim() ||
      bank.iban.trim() ||
      bank.bic.trim() ||
      bank.bankName.trim(),
  );
}

export function isValidIban(value: string): boolean {
  const normalized = value.replace(/\s/g, "").toUpperCase();
  if (!normalized) return true;
  return /^[A-Z]{2}[0-9A-Z]{13,32}$/.test(normalized);
}

export function isValidBic(value: string): boolean {
  const normalized = value.replace(/\s/g, "").toUpperCase();
  if (!normalized) return true;
  return /^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(normalized);
}

export function formatBankAccountMessage(bank: BankAccount): string {
  const lines = ["Coordonnées bancaires :"];

  if (bank.accountName.trim()) {
    lines.push(`Nom du compte : ${bank.accountName.trim()}`);
  }
  if (bank.iban.trim()) {
    lines.push(`IBAN : ${bank.iban.trim()}`);
  }
  if (bank.bic.trim()) {
    lines.push(`BIC/SWIFT : ${bank.bic.trim()}`);
  }
  if (bank.bankName.trim()) {
    lines.push(`Banque : ${bank.bankName.trim()}`);
  }

  return lines.join("\n");
}

export async function getUserBankAccount(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
): Promise<BankAccount> {
  const { data } = await supabase
    .from("profile_bank_accounts")
    .select("account_name, iban, bic, bank_name")
    .eq("profile_id", userId)
    .maybeSingle();

  if (!data) return { ...EMPTY_BANK_ACCOUNT };

  return {
    accountName: data.account_name?.trim() ?? "",
    iban: data.iban?.trim() ?? "",
    bic: data.bic?.trim() ?? "",
    bankName: data.bank_name?.trim() ?? "",
  };
}
