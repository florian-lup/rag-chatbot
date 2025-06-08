"use client";

import { useEffect, useRef } from "react";

/**
 * Provides a ref that automatically scrolls into view when the given
 * dependencies change.
 *
 * Example:
 * const bottomRef = useAutoScroll([messages, isTyping]);
 *
 * <div ref={bottomRef} />
 */
export function useAutoScroll(dependencies: unknown[]): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
} 