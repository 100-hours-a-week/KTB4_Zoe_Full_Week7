import { RefObject, useEffect } from "react";

export function useInfiniteScroll(
  ref: RefObject<Element | null>,
  onLoadMore: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    const target = ref.current;
    if (!target || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, onLoadMore, ref]);
}
