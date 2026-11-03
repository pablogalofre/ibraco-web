"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PROMOTION_PAGES, promotionErrors, type Promotion } from "../lib/promotions";
import PromotionModal from "./promotion-modal";

const shown = new Set<string>();
function sessionKey(id: string) {
  return id === "d7a7a05a-a4d9-4162-a2a5-a56839e80301" ? "ibraco:promo:centro-3x2:2026-11-03" : `ibraco:promo:${id}`;
}
function wasShown(id: string) {
  try { return shown.has(id) || Boolean(sessionStorage.getItem(sessionKey(id))); } catch { return shown.has(id); }
}
export default function SitePromotions() {
  const pathname = usePathname();
  const path = pathname === "/" ? "/" : pathname?.replace(/\/$/, "");
  const eligible = PROMOTION_PAGES.some(([page]) => page === path);
  const [campaigns, setCampaigns] = useState<Promotion[]>([]);
  const [active, setActive] = useState<Promotion | null>(null);
  const [tick, setTick] = useState(0);
  const clockOffset = useRef(0);
  const visitShown = useRef(false);
  useEffect(() => {
    setActive(null); setCampaigns([]); visitShown.current = false;
    if (!eligible) return;
    let alive = true;
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch("/api/public/promotions", { cache: "no-store", credentials: "omit", signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!alive) return;
        clockOffset.current = Number.isFinite(data.serverNow) ? data.serverNow - Date.now() : 0;
        setCampaigns(Array.isArray(data.campaigns) ? data.campaigns.filter((p: Promotion) => {
          try { return promotionErrors(p).length === 0; } catch { return false; }
        }) : []);
      } catch { if (alive) setCampaigns([]); }
    }
    void refresh();
    const poll = window.setInterval(() => void refresh(), 60000);
    const clock = window.setInterval(() => setTick(value => value + 1), 1000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => { alive = false; controller.abort(); clearInterval(poll); clearInterval(clock); window.removeEventListener("focus", onFocus); };
  }, [path, eligible]);
  const now = Date.now() + clockOffset.current;
  const candidate = campaigns.filter(p => p.enabled && p.pages.includes(path ?? "") && Date.parse(p.starts_at) <= now && Date.parse(p.ends_at) > now)
    .sort((a, b) => b.priority - a.priority || Date.parse(b.starts_at) - Date.parse(a.starts_at) || a.id.localeCompare(b.id))[0];
  useEffect(() => {
    setActive(null);
    if (!eligible || !candidate || visitShown.current || wasShown(candidate.id)) return;
    const timer = window.setTimeout(() => {
      if (Date.now() + clockOffset.current < Date.parse(candidate.ends_at) && !wasShown(candidate.id)) setActive(candidate);
    }, candidate.delay_seconds * 1000);
    return () => clearTimeout(timer);
  // Solo un cambio real de campaña reinicia la espera; no el reloj de vencimiento.
  }, [path, eligible, candidate?.id, candidate?.version]);
  void tick;
  if (!eligible || !active || candidate?.id !== active.id || candidate.version !== active.version || now >= Date.parse(active.ends_at)) return null;
  return <PromotionModal key={`${path}:${active.id}:${active.version}`} campaign={active} onClose={() => setActive(null)} onShown={() => {
    shown.add(active.id); visitShown.current = true;
    try { sessionStorage.setItem(sessionKey(active.id), "1"); } catch { /* Sesión privada sin almacenamiento. */ }
  }} />;
}
