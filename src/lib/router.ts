import { useEffect, useState } from "react";

/** Hash routing: works from file://, any static host and inside Capacitor without server config. */
export function useRoute(): string[] {
  const [hash, setHash] = useState(() => location.hash);
  useEffect(() => {
    const on = () => {
      setHash(location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
}

export function href(...parts: (string | number)[]): string {
  return "#/" + parts.map((p) => encodeURIComponent(String(p))).join("/");
}

export function go(...parts: (string | number)[]) {
  location.hash = href(...parts);
}
