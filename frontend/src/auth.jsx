import { createContext, useContext, useState } from "react";
import { api, setSession, clearSession, getUser } from "./api.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());

  async function login(mobile, password) {
    const res = await api("/auth/login", {
      method: "POST",
      body: { mobile, password },
      auth: false,
    });
    const u = { userId: res.userId, name: res.name, role: res.role };
    setSession(res.accessToken, u);
    setUser(u);
    return u;
  }

  async function register(payload) {
    const res = await api("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    });
    const u = { userId: res.userId, name: res.name, role: res.role };
    setSession(res.accessToken, u);
    setUser(u);
    return u;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
