'use client';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

type Turnstile = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: Turnstile } }

export function FormVerification({ action, onToken, resetKey = 0 }: { action: string; onToken: (token: string) => void; resetKey?: number }) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  useEffect(() => { callback.current = onToken; }, [onToken]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!ready || !sitekey || !container.current || !window.turnstile) return;
    callback.current('');
    const id = window.turnstile.render(container.current, {
      sitekey, action, callback: (token: string) => { setFailed(false); callback.current(token); },
      'expired-callback': () => callback.current(''),
      'error-callback': () => { callback.current(''); setFailed(true); },
    });
    return () => window.turnstile?.remove(id);
  }, [ready, sitekey, action, resetKey]);
  if (!sitekey) return <p role="status" className="text-sm text-red-700">Form verification is being configured. Please try again later.</p>;
  return <>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} onError={() => setFailed(true)} />
    <div ref={container} />
    {failed && <p role="alert" className="text-sm text-red-700">Verification could not load. Refresh the page and try again.</p>}
    <label className="hidden" aria-hidden="true">Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
  </>;
}
