"use client";

import { useActionState } from "react";
import { updateSubscriptionAutoRenew, type ActionResult } from "@/app/actions";
import {
  formatSubscriptionDate,
  type UserSubscription,
} from "@/lib/subscription";

const initialState: ActionResult = { success: false, message: "" };

type SubscriptionSettingsSectionProps = {
  subscription: UserSubscription;
};

function subscriptionStatusLabel(subscription: UserSubscription): string {
  if (subscription.active) {
    return subscription.autoRenew ? "Actif — renouvellement automatique" : "Actif — se termine bientôt";
  }

  if (subscription.expiresAt && new Date(subscription.expiresAt) <= new Date()) {
    return "Expiré";
  }

  return "Inactif";
}

export function SubscriptionSettingsSection({
  subscription,
}: SubscriptionSettingsSectionProps) {
  const [state, action, pending] = useActionState(
    updateSubscriptionAutoRenew,
    initialState,
  );

  if (
    !subscription.active &&
    !subscription.startedAt &&
    !subscription.expiresAt
  ) {
    return null;
  }

  return (
    <section className="form-stripe settings-form settings-subscription-section">
      <div className="form-stripe-section">
        <p className="settings-section-title">Abonnement Merline Pro</p>

        <dl className="settings-subscription-details">
          <div className="settings-subscription-detail">
            <dt>Statut</dt>
            <dd>{subscriptionStatusLabel(subscription)}</dd>
          </div>
          <div className="settings-subscription-detail">
            <dt>Début de période</dt>
            <dd>{formatSubscriptionDate(subscription.startedAt)}</dd>
          </div>
          <div className="settings-subscription-detail">
            <dt>Fin de période</dt>
            <dd>{formatSubscriptionDate(subscription.expiresAt)}</dd>
          </div>
        </dl>

        {subscription.active ? (
          <form action={action} className="settings-subscription-renew-form">
            <label className="settings-subscription-renew-option">
              <input
                type="checkbox"
                name="auto_renew"
                value="1"
                defaultChecked={subscription.autoRenew}
                className="settings-subscription-renew-checkbox"
                disabled={pending}
              />
              <span>
                Renouveler automatiquement à la fin de la période
                {!subscription.autoRenew ? (
                  <span className="settings-subscription-renew-note">
                    {" "}
                    — votre accès reste actif jusqu&apos;au{" "}
                    {formatSubscriptionDate(subscription.expiresAt)}.
                  </span>
                ) : null}
              </span>
            </label>

            {state.message ? (
              <p
                className={`settings-form-feedback ${
                  state.success
                    ? "settings-form-feedback-success"
                    : "settings-form-feedback-error"
                }`}
                role="status"
              >
                {state.message}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn-primary form-stripe-submit settings-subscription-submit"
              disabled={pending}
            >
              {pending ? "Enregistrement…" : "Mettre à jour le renouvellement"}
            </button>
          </form>
        ) : subscription.expiresAt ? (
          <p className="settings-subscription-expired-note">
            Votre abonnement a pris fin le{" "}
            {formatSubscriptionDate(subscription.expiresAt)}. Choisissez le forfait
            abonnement lors de votre prochaine publication pour le réactiver.
          </p>
        ) : null}
      </div>
    </section>
  );
}
