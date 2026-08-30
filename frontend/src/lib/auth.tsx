"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { User, UserRole } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    password: string;
    first_name: string;
    last_name?: string;
    phone: string;
    role: "farmer" | "fpo" | "buyer" | "driver" | "ops";
    organization_name?: string;
    location?: string;
    language?: "en" | "hi";
  }) => Promise<void>;
  loginWithGoogle: (data: {
    email: string;
    name: string;
    role: "farmer" | "fpo" | "buyer" | "driver" | "ops";
    avatar_url?: string;
  }) => Promise<void>;
  logout: () => void;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
  isRole: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("farmlink_user");
      const token = localStorage.getItem("farmlink_token");
      if (stored && token) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [loading] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    const data = await api.login(username, password);
    setUser(data.user);
    if (typeof window !== "undefined") {
      localStorage.setItem("farmlink_user", JSON.stringify(data.user));
      localStorage.setItem("farmlink_refresh", data.refresh);
    }
  }, []);

  const register = useCallback(
    async (regData: {
      username: string;
      password: string;
      first_name: string;
      last_name?: string;
      phone: string;
      role: "farmer" | "fpo" | "buyer" | "driver" | "ops";
      organization_name?: string;
      location?: string;
      language?: "en" | "hi";
    }) => {
      const data = await api.register(regData);
      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("farmlink_user", JSON.stringify(data.user));
        localStorage.setItem("farmlink_refresh", data.refresh);
      }
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (googleData: {
      email: string;
      name: string;
      role: "farmer" | "fpo" | "buyer" | "driver" | "ops";
      avatar_url?: string;
    }) => {
      const data = await api.googleLogin(googleData);
      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("farmlink_user", JSON.stringify(data.user));
        localStorage.setItem("farmlink_refresh", data.refresh);
      }
    },
    []
  );

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("farmlink_user");
    }
  }, []);

  const isRole = useCallback(
    (role: UserRole) => {
      return user?.role === role;
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
