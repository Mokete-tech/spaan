
import { createContext } from "react";
import { AuthContextType } from "@/types/auth.types";

// Create context with undefined as default
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the AuthProvider component
export { AuthProvider } from "./AuthProvider";

// Export the useAuth hook
export { useAuth } from "./useAuth";
