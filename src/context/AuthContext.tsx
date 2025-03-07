
import { createContext } from "react";
import { AuthContextType } from "@/types/auth.types";

// Create context with undefined as default
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Re-export the AuthProvider and useAuth from their respective files
export { AuthProvider } from "./AuthProvider";
export { useAuth } from "./useAuth";
