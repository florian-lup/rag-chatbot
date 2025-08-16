import { useEffect, useCallback, type RefObject, type KeyboardEvent } from "react";

export function useAutoScrollToBottom(targetRef: RefObject<HTMLElement | null>, deps: unknown[]) {
  useEffect(() => {
    targetRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useAutoFocus<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    ref.current?.focus();
  }, [ref]);
}

export function useEnterToSubmit(submit: () => void) {
  return useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );
}
