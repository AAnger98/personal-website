type EventProps = Record<string, string | number | boolean>;

type PlausibleFn = (event: string, opts?: { props: EventProps }) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

export function logEvent(eventName: string, props?: EventProps): void {
  if (typeof window === 'undefined') return;
  if (typeof window.plausible === 'function') {
    window.plausible(eventName, props ? { props } : undefined);
  }
}
