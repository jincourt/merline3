"use client";

import { useActionState } from "react";
import { ArrowUp } from "lucide-react";
import { sendConvMessage, type ActionResult } from "@/app/actions";

const initialState: ActionResult = {
  success: false,
  message: "",
};

export function ConvReplyForm({ convId }: { convId: string }) {
  const [state, action, pending] = useActionState(sendConvMessage, initialState);

  return (
    <form action={action} className="dashboard-conv-input-wrap">
      <input type="hidden" name="conv_id" value={convId} />
      <div className="dashboard-conv-input">
        <textarea
          id="reply-body"
          name="body"
          rows={1}
          required
          minLength={1}
          placeholder="Écrire un message…"
          className="dashboard-conv-textarea"
        />
        <button
          type="submit"
          className="dashboard-conv-send"
          disabled={pending}
          aria-label={pending ? "Envoi en cours" : "Envoyer"}
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
      {state.message && !state.success ? (
        <p className="mt-2 text-xs text-[var(--error)]">{state.message}</p>
      ) : null}
    </form>
  );
}
