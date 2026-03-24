import { useEffect, useRef, useState, type RefObject } from "react";

export function useIsSticky(sentinelRef: RefObject<HTMLElement | null>): boolean {
  const [isSticky, setIsSticky] = useState(false);
  const rafId = useRef(0);

  useEffect(() => {
    const check = () => {
      const sentinel = sentinelRef.current;
      if (!sentinel) {
        setIsSticky(false);
        return;
      }
      const rect = sentinel.getBoundingClientRect();
      setIsSticky(rect.bottom <= 16);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [sentinelRef]);

  return isSticky;
}
