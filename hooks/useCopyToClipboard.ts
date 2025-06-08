"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Returns a boolean flag that is true right after a successful copy operation
 * and a function to copy arbitrary text to the clipboard.
 *
 * @param resetInterval Time in milliseconds after which the copied flag
 * resets back to false. Default is 2000 ms.
 */
export function useCopyToClipboard(resetInterval: number = 2000): [boolean, (text: string) => Promise<boolean>] {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Reset the copied state after the specified interval
  useEffect(() => {
    if (isCopied) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsCopied(false), resetInterval);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isCopied, resetInterval]);

  return [isCopied, copy];
} 