"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  HEARTBEAT_MS,
  isUuid,
  parseTrackedPage,
  readUtm,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  shouldSkipTracking,
  VISITOR_COOKIE,
  VISITOR_MAX_AGE,
} from "@/lib/analytics";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[$()*+./?[\\\]^{|}-]/g, "\\$&")}=([^;]*)`),
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function getOrCreateId(name: string, maxAge: number) {
  const existing = readCookie(name);
  if (existing && isUuid(existing)) return existing;
  const created = crypto.randomUUID();
  writeCookie(name, created, maxAge);
  return created;
}

function sendCollect(body: Record<string, unknown>, keepalive = false) {
  const payload = JSON.stringify(body);
  if (keepalive && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/collect", blob);
    return;
  }

  void fetch("/api/analytics/collect", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive,
    credentials: "same-origin",
  }).catch(() => {});
}

export function SiteTracker() {
  const pathname = usePathname();
  const lastKeyRef = useRef<string | null>(null);
  const utmSentRef = useRef(false);

  useEffect(() => {
    function ids() {
      const visitorId = getOrCreateId(VISITOR_COOKIE, VISITOR_MAX_AGE);
      const sessionId = getOrCreateId(SESSION_COOKIE, SESSION_MAX_AGE);
      return { visitorId, sessionId };
    }

    function trackPageview() {
      const page = parseTrackedPage(window.location.pathname || pathname || "/");
      if (shouldSkipTracking(page.path)) return;
      if (document.visibilityState === "hidden") return;

      const { visitorId, sessionId } = ids();
      const key = `${sessionId}:${page.path}`;
      if (lastKeyRef.current === key) return;
      lastKeyRef.current = key;

      const utm = utmSentRef.current ? {} : readUtm(window.location.search);
      utmSentRef.current = true;

      sendCollect({
        visitorId,
        sessionId,
        path: page.path,
        referrer: document.referrer || null,
        ...utm,
        isHeartbeat: false,
      });
      writeCookie(SESSION_COOKIE, sessionId, SESSION_MAX_AGE);
    }

    function heartbeat(keepalive = false) {
      const page = parseTrackedPage(window.location.pathname || "/");
      if (shouldSkipTracking(page.path)) return;

      const { visitorId, sessionId } = ids();
      const key = `${sessionId}:${page.path}`;
      if (lastKeyRef.current !== key) {
        trackPageview();
        return;
      }

      sendCollect(
        {
          visitorId,
          sessionId,
          path: page.path,
          isHeartbeat: true,
        },
        keepalive,
      );
      writeCookie(SESSION_COOKIE, sessionId, SESSION_MAX_AGE);
    }

    trackPageview();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") heartbeat();
    }, HEARTBEAT_MS);

    function onVisibility() {
      if (document.visibilityState === "hidden") {
        heartbeat(true);
        return;
      }
      trackPageview();
    }

    function onPageHide() {
      heartbeat(true);
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [pathname]);

  return null;
}
