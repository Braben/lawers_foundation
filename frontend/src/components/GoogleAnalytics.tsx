'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export function GoogleAnalytics() {
  const path = usePathname();
  const previous = useRef('');
  useEffect(() => {
    if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;
    const disabled = path.startsWith('/admin') || navigator.doNotTrack === '1' || !!(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
    (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = disabled;
    if (disabled) { previous.current = ''; return; }
    if (previous.current === path) return;
    const analytics = window as AnalyticsWindow;
    if (!analytics.gtag) {
      analytics.dataLayer = analytics.dataLayer || [];
      // Google's queue consumes the function's arguments object.
      // eslint-disable-next-line prefer-rest-params
      analytics.gtag = function () { analytics.dataLayer!.push(arguments); };
      analytics.gtag('js', new Date());
      analytics.gtag('config', measurementId, { send_page_view: false, page_location: window.location.origin + path, page_referrer: document.referrer ? new URL(document.referrer).origin : '', allow_google_signals: false, allow_ad_personalization_signals: false });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    }
    analytics.gtag('set', { page_location: window.location.origin + path });
    analytics.gtag('event', 'page_view', {
      page_location: window.location.origin + path,
      page_referrer: previous.current ? window.location.origin + previous.current : (document.referrer ? new URL(document.referrer).origin : ''),
      page_title: document.title,
    });
    previous.current = path;
  }, [path]);
  return null;
}
