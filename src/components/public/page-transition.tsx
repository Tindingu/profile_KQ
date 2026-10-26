"use client";

import NextLink, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

const TransitionContext = createContext<{
  report: (id: string, pending: boolean) => void;
  prepareNavigation: (changesPage: boolean) => void;
  locale: string;
} | null>(null);

function SoundSignature() {
  return (
    <span className="sound-signature" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((bar) => <i key={bar} />)}
    </span>
  );
}

export function PageTransition({ children, brand, locale }: {
  children: ReactNode;
  brand: string;
  locale: string;
}) {
  const [pending, setPending] = useState<Set<string>>(() => new Set());
  const [changesPage, prepareNavigation] = useState(true);
  const pathname = usePathname();
  useEffect(() => {
    const onPopState = () => prepareNavigation(window.location.pathname !== pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [pathname]);
  const report = useCallback((id: string, active: boolean) => {
    setPending((previous) => {
      if (previous.has(id) === active) return previous;
      const next = new Set(previous);
      if (active) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const busy = changesPage && pending.size > 0;
  return (
    <TransitionContext.Provider value={{ report, prepareNavigation, locale }}>
      {children}
      <div className={`stage-transition${busy ? " is-active" : ""}`} aria-hidden="true">
        <div className="stage-progress" />
        <div className="stage-wing stage-wing-left" />
        <div className="stage-wing stage-wing-right" />
        <div className="stage-signature">
          <span className="stage-orbit"><SoundSignature /></span>
          <p className="stage-brand">{brand}</p>
          <span className="stage-rule" />
          <p className="stage-caption">{locale === "en" ? "Every moment, a story" : "Mỗi khoảnh khắc, một câu chuyện"}</p>
          <span className="stage-cue">{locale === "en" ? "THE STORY CONTINUES" : "CÂU CHUYỆN TIẾP NỐI"}</span>
        </div>
      </div>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {busy ? locale === "en" ? "Loading the next story…" : "Đang mở câu chuyện tiếp theo…" : ""}
      </span>
    </TransitionContext.Provider>
  );
}

function PendingLink() {
  const { pending } = useLinkStatus();
  const context = useContext(TransitionContext);
  const id = useId();
  const report = context?.report;
  useEffect(() => {
    report?.(id, pending);
    return () => report?.(id, false);
  }, [id, pending, report]);
  return null;
}

// Keep Next's navigation, prefetching, modified clicks and error handling intact.
export function TransitionLink({ children, href, onNavigate, ...props }: ComponentProps<typeof NextLink>) {
  const context = useContext(TransitionContext);
  return (
    <NextLink
      {...props}
      href={href}
      onNavigate={(event) => {
        let canceled = false;
        onNavigate?.({ preventDefault() { canceled = true; event.preventDefault(); } });
        if (canceled) return;
        const destination = typeof href === "string"
          ? new URL(href, window.location.href).pathname
          : href.pathname || window.location.pathname;
        context?.prepareNavigation(destination !== window.location.pathname);
      }}
    >
      {children}<PendingLink />
    </NextLink>
  );
}

export function PageScene({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div key={pathname} className="page-scene">{children}</div>;
}

export function StageLoading() {
  const context = useContext(TransitionContext);
  const id = useId();
  const report = context?.report;
  useEffect(() => {
    report?.(id, true);
    return () => report?.(id, false);
  }, [id, report]);
  return (
    <main className="route-loading" aria-busy="true">
      <SoundSignature />
      <p role={context ? undefined : "status"}>
        {context?.locale === "en" ? "A new story is about to begin…" : "Một câu chuyện mới sắp bắt đầu…"}
      </p>
      <span className="route-loading-line" aria-hidden="true" />
    </main>
  );
}
