"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Message = {
  id: number;
  from: "agent" | "seller";
  text: string;
};

const CONVERSATIONS: Omit<Message, "id">[][] = [
  [
    {
      from: "agent",
      text: "Bonjour ! J'ai trouvé un client intéressé par votre annonce.",
    },
    {
      from: "seller",
      text: "Super nouvelle — c'est pour le canapé scandinave ?",
    },
    {
      from: "agent",
      text: "Exactement. Il souhaite visiter samedi après-midi.",
    },
    {
      from: "seller",
      text: "14h lui convient. Merci pour le contact !",
    },
    {
      from: "agent",
      text: "C'est noté, je lui confirme. Bonne vente !",
    },
  ],
  [
    {
      from: "agent",
      text: "Bonjour, un client cherche des cours de piano à domicile.",
    },
    {
      from: "seller",
      text: "Parfait, j'ai de la place mardi et jeudi.",
    },
    {
      from: "agent",
      text: "Il préfère mardi 18h — ça vous va ?",
    },
    {
      from: "seller",
      text: "Oui, je confirme. Merci !",
    },
  ],
  [
    {
      from: "agent",
      text: "J'ai un acheteur pour votre vélo électrique.",
    },
    {
      from: "seller",
      text: "Il propose quel prix ?",
    },
    {
      from: "agent",
      text: "850 CHF, proche de votre annonce.",
    },
    {
      from: "seller",
      text: "D'accord, on peut se voir demain.",
    },
    {
      from: "agent",
      text: "Je lui transmets vos coordonnées.",
    },
  ],
];

const MAX_VISIBLE = 3;
const MESSAGE_DELAY_MS = 1600;
const END_HOLD_MS = 700;
const CONVERSATION_FADE_MS = 220;
const GAP_BETWEEN_CONV_MS = 200;

const messageMotion = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18, ease: "easeOut" as const },
  },
};

function MessageIcon() {
  return (
    <svg
      className="h-4 w-4 text-white/70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function HeroConversationAnimation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const loopIdRef = useRef(0);

  useEffect(() => {
    const loopId = ++loopIdRef.current;
    const timers: number[] = [];
    let sequenceId = 0;

    const isActive = () => loopId === loopIdRef.current;

    const schedule = (fn: () => void, ms: number) => {
      const timer = window.setTimeout(() => {
        if (isActive()) fn();
      }, ms);
      timers.push(timer);
    };

    const updateMessages = (next: Message[] | ((current: Message[]) => Message[])) => {
      if (!isActive()) return;
      setMessages(next);
    };

    const playConversation = (convIndex: number) => {
      if (!isActive()) return;

      const script = CONVERSATIONS[convIndex];
      let step = 0;

      const showStep = () => {
        if (!isActive()) return;

        const item = script[step];
        const message = { ...item, id: sequenceId };
        sequenceId += 1;

        if (step === 0) {
          updateMessages([message]);
        } else {
          updateMessages((current) =>
            [...current, message].slice(-MAX_VISIBLE),
          );
        }

        step += 1;

        if (step < script.length) {
          schedule(showStep, MESSAGE_DELAY_MS);
          return;
        }

        schedule(() => {
          updateMessages([]);
          schedule(
            () => playConversation((convIndex + 1) % CONVERSATIONS.length),
            CONVERSATION_FADE_MS + GAP_BETWEEN_CONV_MS,
          );
        }, END_HOLD_MS);
      };

      showStep();
    };

    setMessages([]);
    playConversation(0);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="w-full max-w-sm rounded-md border border-white/15 bg-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.2)] backdrop-blur-sm md:max-w-md">
        <div className="flex items-center gap-2 px-4 py-3 md:px-5">
          <MessageIcon />
          <p className="text-xs font-medium text-white/90">Messages</p>
        </div>
        <div className="border-b border-white/10" />

        <div
          className="flex h-[200px] flex-col justify-end gap-2.5 overflow-hidden px-4 pb-4 pt-3 md:px-5 md:pb-5"
          aria-live="polite"
          aria-atomic="false"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {messages.map((message) => {
              const isAgent = message.from === "agent";

              return (
                <motion.div
                  key={message.id}
                  layout="position"
                  variants={messageMotion}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{
                    layout: {
                      duration: 0.22,
                      ease: [0.25, 0.1, 0.25, 1] as const,
                    },
                  }}
                  className={`flex w-full shrink-0 ${
                    isAgent ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[82%] rounded-md px-3.5 py-2 text-sm leading-snug ${
                      isAgent
                        ? "rounded-bl-md border border-white/15 bg-white/15 text-white"
                        : "rounded-br-md bg-white text-[#1e1b4b]"
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
