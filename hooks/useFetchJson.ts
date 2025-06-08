"use client";

import { useState, useCallback } from "react";

interface UseFetchJsonReturn<TResponse> {
  loading: boolean;
  error: string | null;
  fetchJson: <TRequest = unknown>(
    url: string,
    method?: "GET" | "POST" | "PUT" | "DELETE",
    body?: TRequest
  ) => Promise<TResponse | null>;
}

/**
 * Simple wrapper around the Fetch API that handles JSON serialization,
 * tracks loading & error state, and returns typed responses.
 */
export function useFetchJson<TResponse = unknown>(): UseFetchJsonReturn<TResponse> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJson = useCallback(
    async <TRequest = unknown>(
      url: string,
      method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
      body?: TRequest
    ): Promise<TResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) throw new Error(await res.text());

        const data = (await res.json()) as TResponse;
        setLoading(false);
        return data;
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message ?? "Unknown error");
        setLoading(false);
        return null;
      }
    },
    []
  );

  return { loading, error, fetchJson };
} 