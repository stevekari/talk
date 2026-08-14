import { useState, useCallback } from "react";

// Simple localStorage-backed auth hook.
// Stores { token, userId, username, avatarUrl } as JSON under "user".
export function useAuth() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    if (!raw || !token) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const loginUser = useCallback((authResponse) => {
    localStorage.setItem("token", authResponse.token);
    localStorage.setItem("user", JSON.stringify(authResponse));
    setUser(authResponse);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const updateStoredUser = useCallback((partialUser) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...partialUser };
      if (partialUser?.token) {
        localStorage.setItem("token", partialUser.token);
      }
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    user,
    loginUser,
    logout,
    updateStoredUser,
    isAuthenticated: !!user,
  };
}
