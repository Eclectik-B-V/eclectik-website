import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "@/lib/tracking";

/**
 * Reports a GA4 page view on every client-side route change.
 *
 * Without this, GA4 sees one page view per visit: the gtag('config', ...) call
 * in index.html fires on the document load, and wouter swaps every following
 * route without one. All the traffic on /contact, /scorecard, /glint and the
 * case studies would land on whichever page the visitor arrived at.
 */
export default function PageViewTracker() {
  const [pathname] = useLocation();
  const isFirstRoute = useRef(true);

  useEffect(() => {
    // The config call already reported the landing page, so reporting it here
    // too would double-count it.
    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }

    // React applies a page's <title> while committing the new route, but this
    // effect can run before the one that sets it. A frame later the title in
    // the document is the new page's.
    const frame = requestAnimationFrame(() => trackPageView());
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
