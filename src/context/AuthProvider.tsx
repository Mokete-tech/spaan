
import React, { useState, useEffect, createContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { refreshSession } from "@/utils/paymentProcessing";
import { captureError } from "@/utils/errorHandling";
import { AuthContextType, Profile } from "@/types/auth.types";
import { fetchUserProfile, updateRole } from "@/utils/authUtils";
import { AuthContext } from "./AuthContext";
