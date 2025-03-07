
import { Session, User } from "@supabase/supabase-js";

export type UserRole = "user" | "provider" | "admin" | null;

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone?: string | null;
  role?: UserRole;
  is_profile_complete?: boolean;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserRole: (role: "user" | "provider") => Promise<void>;
  isProfileComplete: boolean;
}
