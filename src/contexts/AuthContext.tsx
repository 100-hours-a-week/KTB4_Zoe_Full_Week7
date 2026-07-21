import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type React from "react";
import { setUnauthorizedHandler } from "@/api/client";
import type { AuthStatus, CurrentUser } from "@/types/domain";
import { clearCurrentUser, getCurrentUser, saveCurrentUser } from "@/utils/storage";

type AuthContextValue = {
  authStatus: AuthStatus;
  user: CurrentUser | null;
  setUserFromResponse: (user: Record<string, unknown>) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("unknown");

  useEffect(() => {
    const storedUser = getCurrentUser();
    setUser(storedUser);
    setAuthStatus(storedUser ? "authenticated" : "guest");
  }, []);

  const clearUser = useCallback(() => {
    clearCurrentUser();
    setUser(null);
    setAuthStatus("guest");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearUser);
    return () => setUnauthorizedHandler(null);
  }, [clearUser]);

  const setUserFromResponse = useCallback((nextUser: Record<string, unknown>) => {
    saveCurrentUser(nextUser);
    const storedUser = getCurrentUser();
    setUser(storedUser);
    setAuthStatus(storedUser ? "authenticated" : "guest");
  }, []);

  const value = useMemo(
    () => ({
      authStatus,
      user,
      setUserFromResponse,
      clearUser,
      isAuthenticated: authStatus === "authenticated",
    }),
    [authStatus, clearUser, setUserFromResponse, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
