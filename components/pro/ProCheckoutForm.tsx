"use client";

import { useState } from "react";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { ProCheckoutStarRating } from "./ProCheckoutStars";
import { MotionDiv } from "@/components/ui/motion";

const PAYMENT_METHODS = [
  { value: "card", label: "Carte bancaire" },
  { value: "paypal", label: "PayPal" },
  { value: "apple_pay", label: "Apple Pay" },
  { value: "paysafecard", label: "Paysafecard" },
  { value: "twint", label: "Twint" },
  { value: "crypto", label: "Crypto" },
];

const AMOUNT_PRESETS = [5, 25, 50];

export function ProCheckoutForm() {
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [includeMessage, setIncludeMessage] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);

  function selectPreset(value: number) {
    setAmount(String(value));
  }

  return (
    <form
      className="pro-checkout-form w-full"
      onSubmit={(event) => event.preventDefault()}
    >
      <SelectDropdown
        label="Moyen de paiement"
        value={method}
        onChange={setMethod}
        options={PAYMENT_METHODS}
        placeholder="Choisir…"
        className="pro-checkout-select"
      />

      <div className="mt-5">
        <label htmlFor="pro-amount" className="pro-checkout-label">
          Montant
        </label>
        <div className="pro-checkout-amount mt-2">
          <span className="pro-checkout-currency">CHF</span>
          <input
            id="pro-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="pro-checkout-input"
          />
        </div>
        <div className="pro-checkout-presets mt-2">
          {AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`pro-checkout-preset ${
                amount === String(preset) ? "pro-checkout-preset-active" : ""
              }`}
              onClick={() => selectPreset(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label className="pro-checkout-option">
          <input
            type="checkbox"
            checked={includeMessage}
            onChange={(event) => setIncludeMessage(event.target.checked)}
            className="pro-checkout-option-input"
          />
          <span>Inclure un message</span>
        </label>
      </div>

      {includeMessage ? (
        <MotionDiv delay={0.04}>
          <div className="mt-5">
            <div className="pro-checkout-label-row">
              <label htmlFor="pro-name" className="pro-checkout-label">
                Nom
              </label>
              <span className="pro-checkout-optional">Optionnel</span>
            </div>
            <input
              id="pro-name"
              type="text"
              placeholder="Votre nom"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="pro-checkout-field mt-2"
            />
          </div>

          <div className="mt-5">
            <label htmlFor="pro-message" className="pro-checkout-label">
              Message
            </label>
            <textarea
              id="pro-message"
              rows={3}
              placeholder="Votre message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="pro-checkout-textarea mt-2"
            />
          </div>

          <div className="mt-5">
            <span className="pro-checkout-label">Note</span>
            <ProCheckoutStarRating
              value={rating}
              onChange={setRating}
              className="mt-2"
            />
          </div>
        </MotionDiv>
      ) : null}

      <button
        type="submit"
        disabled={!method || !amount}
        className="pro-checkout-submit mt-8"
      >
        Payer
      </button>
    </form>
  );
}
