"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Star } from "lucide-react";

type Message = {
  id: number;
  from: "agent" | "seller";
  text: string;
};

type ScriptStep =
  | { type: "message"; from: "agent" | "seller"; text: string }
  | { type: "typing" };

type View = "launcher" | "messenger";

const SCRIPT: ScriptStep[] = [
  {
    type: "message",
    from: "agent",
    text: "J'ai un acheteur pour votre vélo électrique.",
  },
  { type: "message", from: "seller", text: "Il propose quel prix ?" },
  {
    type: "message",
    from: "agent",
    text: "850 CHF, proche de votre annonce.",
  },
  {
    type: "message",
    from: "seller",
    text: "D'accord, on peut se voir demain.",
  },
  {
    type: "message",
    from: "agent",
    text: "Je lui transmets vos coordonnées.",
  },
  { type: "typing" },
  {
    type: "message",
    from: "seller",
    text: "La vente s'est bien passée — la commission vient d'être versée. Merci !",
  },
  {
    type: "message",
    from: "agent",
    text: "Félicitations ! Merci pour votre confiance, à bientôt sur Merline.",
  },
];

const MAX_VISIBLE = 4;

const TIMING = {
  LAUNCHER_HOLD_MS: 600,
  NOTIF_HOLD_MS: 800,
  OPEN_ANIM_MS: 450,
  MESSAGE_MS: 1350,
  TYPING_MS: 1000,
  TYPING_FADE_MS: 180,
  BEFORE_STARS_MS: 2100,
  STAR_STEP_MS: 95,
  STARS_HOLD_MS: 950,
  CLOSE_ANIM_MS: 500,
  LOOP_GAP_MS: 450,
} as const;

const messageMotion = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: "easeOut" as const },
  },
};

const panelMotion = {
  initial: { opacity: 0, scale: 0.52, y: 16 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.52,
    y: 16,
    transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] as const },
  },
};

function MessageIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <MessageCircle
      className={`text-white/80 ${className}`}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <Star
      className={`h-7 w-7 md:h-8 md:w-8 ${filled ? "text-white" : "text-white/30"}`}
      fill={filled ? "currentColor" : "transparent"}
      strokeWidth={1.25}
      aria-hidden
    />
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-3.5 py-2.5"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-white/70"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={{
            duration: 0.85,
            repeat: Infinity,
            delay: i * 0.18,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <p className="text-xs font-medium text-white/80">Transaction réussie</p>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= count;

          return (
            <motion.div
              key={star}
              initial={false}
              animate={{
                scale: filled ? [0.6, 1.12, 1] : 0.9,
                opacity: filled ? 1 : 0.35,
              }}
              transition={{
                duration: filled ? 0.38 : 0.2,
                ease: filled ? ([0.34, 1.4, 0.64, 1] as const) : "easeOut",
              }}
            >
              <StarIcon filled={filled} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MessagesAppIcon({ showNotif }: { showNotif: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className="flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-md border border-white/20 bg-gradient-to-b from-white/20 to-white/10 shadow-[0_12px_32px_rgba(15,23,42,0.25)] md:h-16 md:w-16">
          <MessageIcon className="h-8 w-8 text-white" />
        </div>
        <AnimatePresence>
          {showNotif ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.28, ease: [0.34, 1.3, 0.64, 1] }}
              className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold leading-none text-[#4f46e5] shadow-[0_2px_8px_rgba(15,23,42,0.2)] ring-2 ring-[#4f46e5]"
            >
              1
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <span className="text-[11px] font-medium text-white/75">Messages</span>
    </div>
  );
}

function MessengerPanel({
  messages,
  isTyping,
  starCount,
}: {
  messages: Message[];
  isTyping: boolean;
  starCount: number;
}) {
  const showStars = starCount > 0;

  return (
    <div className="w-full max-w-sm rounded-md border border-white/15 bg-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.2)] backdrop-blur-sm md:max-w-md">
      <div className="flex items-center gap-2 px-4 py-3 md:px-5">
        <MessageIcon />
        <p className="text-xs font-medium text-white/90">Messages</p>
      </div>
      <div className="border-b border-white/10" />

      <div
        className="flex h-[220px] flex-col overflow-hidden px-4 pb-4 pt-3 md:px-5 md:pb-5"
        aria-live="polite"
        aria-atomic="false"
      >
        {isTyping ? (
          <div className="flex flex-1 items-center justify-center">
            <TypingIndicator />
          </div>
        ) : showStars ? (
          <div className="flex flex-1 items-center justify-center">
            <StarRating count={starCount} />
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-end gap-2.5">
            <AnimatePresence initial={false} mode="popLayout">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAgent = message.from === "agent";

  return (
    <motion.div
      layout="position"
      variants={messageMotion}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        layout: {
          duration: 0.24,
          ease: [0.25, 0.1, 0.25, 1] as const,
        },
      }}
      className={`flex w-full shrink-0 ${isAgent ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[82%] rounded-md px-3.5 py-2 text-sm leading-snug ${
          isAgent
            ? "rounded-bl-sm border border-white/15 bg-white/15 text-white"
            : "rounded-br-sm bg-white text-[#1e1b4b]"
        }`}
      >
        {message.text}
      </div>
    </motion.div>
  );
}

export function HeroConversationAnimation() {
  const [view, setView] = useState<View>("launcher");
  const [showNotif, setShowNotif] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const loopIdRef = useRef(0);

  useEffect(() => {
    const loopId = ++loopIdRef.current;
    const timers: number[] = [];

    const isActive = () => loopId === loopIdRef.current;

    const schedule = (fn: () => void, ms: number) => {
      const timer = window.setTimeout(() => {
        if (isActive()) fn();
      }, ms);
      timers.push(timer);
    };

    const resetChat = () => {
      setMessages([]);
      setIsTyping(false);
      setStarCount(0);
    };

    const closeAndRestart = () => {
      setView("launcher");
      setShowNotif(false);
      resetChat();
      schedule(runCycle, TIMING.CLOSE_ANIM_MS + TIMING.LOOP_GAP_MS);
    };

    const playStars = () => {
      setMessages([]);
      let count = 0;

      const step = () => {
        count += 1;
        setStarCount(count);
        if (count < 5) {
          schedule(step, TIMING.STAR_STEP_MS);
          return;
        }
        schedule(closeAndRestart, TIMING.STARS_HOLD_MS);
      };

      schedule(step, TIMING.STAR_STEP_MS);
    };

    const playChat = () => {
      let stepIndex = 0;
      let sequenceId = 0;

      const runStep = () => {
        const step = SCRIPT[stepIndex];

        if (step.type === "typing") {
          setMessages([]);
          setIsTyping(true);
          schedule(() => {
            setIsTyping(false);
            stepIndex += 1;
            schedule(runStep, TIMING.TYPING_FADE_MS);
          }, TIMING.TYPING_MS);
          return;
        }

        const message: Message = {
          id: sequenceId,
          from: step.from,
          text: step.text,
        };
        sequenceId += 1;

        setMessages((current) =>
          current.length === 0
            ? [message]
            : [...current, message].slice(-MAX_VISIBLE),
        );

        stepIndex += 1;

        if (stepIndex < SCRIPT.length) {
          schedule(runStep, TIMING.MESSAGE_MS);
          return;
        }

        schedule(playStars, TIMING.BEFORE_STARS_MS);
      };

      runStep();
    };

    const runCycle = () => {
      resetChat();
      setView("launcher");
      setShowNotif(false);

      schedule(() => setShowNotif(true), TIMING.LAUNCHER_HOLD_MS);

      schedule(() => {
        setView("messenger");
        schedule(playChat, TIMING.OPEN_ANIM_MS);
      }, TIMING.LAUNCHER_HOLD_MS + TIMING.NOTIF_HOLD_MS);
    };

    runCycle();

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="flex h-full min-h-[280px] w-full max-w-sm flex-col items-center justify-center md:max-w-md">
      <AnimatePresence mode="wait">
        {view === "launcher" ? (
          <motion.div
            key="launcher"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <MessagesAppIcon showNotif={showNotif} />
          </motion.div>
        ) : (
          <motion.div
            key="messenger"
            variants={panelMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mx-auto w-full"
          >
            <MessengerPanel
              messages={messages}
              isTyping={isTyping}
              starCount={starCount}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
