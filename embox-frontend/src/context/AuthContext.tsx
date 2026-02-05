import { createContext, useContext } from "react";

export type User = {
  role: "admin";
};

type AuthContextType = {
  token: string;
  user: User;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
};
