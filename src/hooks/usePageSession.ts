import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageError } from "@/lib/utils";
import {
  AccessToken,
  TokenExpiredError,
  TokenMissingError,
} from "@/lib/tokens";
import { tokenStorage } from "@/lib/token-storage";

export type PageSessionAuthIssue =
  | "token_missing"
  | "token_invalid"
  | "token_expired_initial"
  | "token_expired_runtime";

export interface PageSessionState {
  error: PageError | null;
  accessToken: AccessToken | null;
  authIssue: PageSessionAuthIssue | null;
  hasTokenQuery: boolean;
  isLoadingState: boolean;
  setError: (error: PageError | null) => void;
  setIsLoadingState: (loading: boolean) => void;
  handleTokenExpired: () => void;
}

export const usePageSession = (): PageSessionState => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasTokenQuery = searchParams.has("token");
  const [externalError, setError] = useState<PageError | null>(null);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(false);
  const [runtimeAuthIssue, setRuntimeAuthIssue] =
    useState<PageSessionAuthIssue | null>(null);

  const handleTokenExpired = () => {
    console.warn("Settings token expired");
    tokenStorage.clearToken();
    setRuntimeAuthIssue("token_expired_runtime");
    setError(PageError.blocker("errors.expired"));
  };

  // Parse token and validate, deriving both token and error state
  // Priority: sessionStorage first, then URL as fallback
  // IMPORTANT: Save token to sessionStorage synchronously during render to avoid race conditions
  const { accessToken, tokenError, initialAuthIssue } = useMemo(() => {
    try {
      // Check sessionStorage first
      let rawToken = tokenStorage.getToken();

      // If not in sessionStorage, check URL (fallback for backward compatibility)
      if (!rawToken) {
        const urlToken = searchParams.get("token");
        if (urlToken) {
          rawToken = urlToken;
          // Save to sessionStorage immediately (synchronously during render)
          // This ensures token is persisted as soon as it's found, regardless of hook execution order
          tokenStorage.setToken(urlToken);
        }
      } else {
        // If token exists in sessionStorage, check if URL has a different token (overwrite)
        const urlToken = searchParams.get("token");
        if (urlToken && urlToken !== rawToken) {
          // New token in URL overwrites existing token in storage
          rawToken = urlToken;
          tokenStorage.setToken(urlToken);
        }
      }

      // If no token found in either location, return error
      if (!rawToken) {
        console.warn("No token found in sessionStorage or URL.");
        return {
          accessToken: null,
          tokenError: PageError.blocker("errors.not_found"),
          initialAuthIssue: "token_missing" as const,
        };
      }

      const token = new AccessToken(rawToken);

      console.info("Session parameters are available!", token.decoded);

      return {
        accessToken: token,
        tokenError: null,
        initialAuthIssue: null,
      };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        tokenStorage.clearToken();
        return {
          accessToken: null,
          tokenError: PageError.blocker("errors.expired"),
          initialAuthIssue: "token_expired_initial" as const,
        };
      } else if (err instanceof TokenMissingError) {
        console.warn("No token found in sessionStorage or URL.");
        return {
          accessToken: null,
          tokenError: PageError.blocker("errors.not_found"),
          initialAuthIssue: "token_missing" as const,
        };
      } else {
        console.warn("Error decoding token:", err);
        return {
          accessToken: null,
          tokenError: PageError.blocker("errors.not_valid"),
          initialAuthIssue: "token_invalid" as const,
        };
      }
    }
  }, [searchParams]);

  // Handle URL cleanup (remove token from URL after it's been saved to sessionStorage)
  // This runs after render to avoid side effects during render
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      // Token has already been saved to sessionStorage in useMemo above
      // Now remove it from URL without adding to history
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("token");
      const newSearch = newSearchParams.toString();
      const newUrl = `${window.location.pathname}${
        newSearch ? `?${newSearch}` : ""
      }`;
      navigate(newUrl, { replace: true });
    }
  }, [searchParams, navigate]);

  // Use tokenError if present, otherwise use external error
  const error = tokenError || externalError;
  const authIssue = initialAuthIssue ?? runtimeAuthIssue;

  return {
    error,
    accessToken,
    authIssue,
    hasTokenQuery,
    isLoadingState,
    setError,
    setIsLoadingState,
    handleTokenExpired,
  };
};
