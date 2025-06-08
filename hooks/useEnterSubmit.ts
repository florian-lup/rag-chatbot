"use client";

import { useCallback, KeyboardEvent } from "react";

/**
 * Returns an onKeyDown handler that calls the provided callback when the user
 * presses Enter without holding Shift. Useful for chat inputs or any multiline
 * textarea where Enter submits and Shift+Enter creates a newline.
 */
export function useEnterSubmit(callback: () => void) {
  return useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        callback();
      }
    },
    [callback]
  );
} 