// Ensures platform.twitter.com/widgets.js is loaded only once.
let widgetsPromise: Promise<void> | null = null;

export function loadXWidgets(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).twttr?.widgets) return Promise.resolve();

  if (!widgetsPromise) {
    widgetsPromise = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://platform.twitter.com/widgets.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load X widgets.js"));
      document.head.appendChild(s);
    });
  }
  return widgetsPromise;
}
