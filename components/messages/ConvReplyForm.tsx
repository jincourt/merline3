"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { sendConvMessage, type ActionResult } from "@/app/actions";
import { formatBankAccountMessage } from "@/lib/profile-bank";
import type { BankAccount } from "@/lib/profile-bank";

const initialState: ActionResult = {
  success: false,
  message: "",
};

type ConvReplyFormProps = {
  convId: string;
  phone?: string;
  bankAccount?: BankAccount;
};

function resizeTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function ConvReplyForm({
  convId,
  phone = "",
  bankAccount,
}: ConvReplyFormProps) {
  const [state, action, pending] = useActionState(sendConvMessage, initialState);
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasPhone = phone.trim().length >= 8;
  const hasBank = Boolean(
    bankAccount &&
      (bankAccount.accountName.trim() ||
        bankAccount.iban.trim() ||
        bankAccount.bic.trim() ||
        bankAccount.bankName.trim()),
  );
  const hasShareOptions = hasPhone || hasBank;

  const syncTextareaHeight = useCallback(() => {
    resizeTextarea(textareaRef.current);
  }, []);

  useEffect(() => {
    syncTextareaHeight();
  }, [syncTextareaHeight]);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (state.success && textareaRef.current) {
      textareaRef.current.value = "";
      syncTextareaHeight();
    }
  }, [state.success, syncTextareaHeight]);

  function insertShareMessage(text: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const prefix = textarea.value.trim() ? `${textarea.value.trim()}\n\n` : "";
    textarea.value = `${prefix}${text}`;
    textarea.focus();
    syncTextareaHeight();
    setMenuOpen(false);
  }

  return (
    <form action={action} className="messages-conv-compose">
      <input type="hidden" name="conv_id" value={convId} />

      <div className="messages-conv-compose-field">
        <textarea
          ref={textareaRef}
          id="reply-body"
          name="body"
          rows={1}
          required
          minLength={1}
          placeholder="Écrire un message…"
          className="messages-conv-textarea"
          onInput={syncTextareaHeight}
        />

        <div className="messages-conv-compose-actions">
          {hasShareOptions ? (
            <div ref={menuRef} className="messages-conv-share">
              <button
                type="button"
                className="messages-conv-action-btn"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Partager des informations"
                onClick={() => setMenuOpen((value) => !value)}
              >
                <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>

              {menuOpen ? (
                <div className="messages-conv-share-menu" role="menu">
                  {hasPhone ? (
                    <button
                      type="button"
                      role="menuitem"
                      className="messages-conv-share-item"
                      onClick={() =>
                        insertShareMessage(`Mon numéro : ${phone.trim()}`)
                      }
                    >
                      Partager mon numéro
                    </button>
                  ) : null}
                  {hasBank && bankAccount ? (
                    <button
                      type="button"
                      role="menuitem"
                      className="messages-conv-share-item"
                      onClick={() =>
                        insertShareMessage(formatBankAccountMessage(bankAccount))
                      }
                    >
                      Partager mes coordonnées bancaires
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            className="messages-conv-send"
            disabled={pending}
            aria-label={pending ? "Envoi en cours" : "Envoyer"}
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      {state.message && !state.success ? (
        <p className="messages-conv-error">{state.message}</p>
      ) : null}
    </form>
  );
}
