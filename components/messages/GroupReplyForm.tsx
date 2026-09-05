"use client";

import { useActionState, useCallback, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { sendGroupMessage, type ActionResult } from "@/app/actions";
import { resizeTextarea } from "@/components/messages/textarea-utils";

const initialState: ActionResult = {
  success: false,
  message: "",
};

type GroupReplyFormProps = {
  groupId: string;
};

export function GroupReplyForm({ groupId }: GroupReplyFormProps) {
  const [state, action, pending] = useActionState(sendGroupMessage, initialState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const syncTextareaHeight = useCallback(() => {
    resizeTextarea(textareaRef.current);
  }, []);

  useEffect(() => {
    syncTextareaHeight();
  }, [syncTextareaHeight]);

  useEffect(() => {
    if (state.success && textareaRef.current) {
      textareaRef.current.value = "";
      syncTextareaHeight();
    }
  }, [state.success, syncTextareaHeight]);

  return (
    <form action={action} className="messages-conv-compose">
      <input type="hidden" name="group_id" value={groupId} />

      <div className="messages-conv-compose-field">
        <textarea
          ref={textareaRef}
          id="group-reply-body"
          name="body"
          rows={1}
          required
          minLength={1}
          placeholder="Écrire un message…"
          className="messages-conv-textarea"
          onInput={syncTextareaHeight}
        />

        <div className="messages-conv-compose-actions">
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
