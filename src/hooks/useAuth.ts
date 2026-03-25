import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours
const LOGIN_TS_KEY = "zig_login_ts";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    localStorage.removeItem(LOGIN_TS_KEY);
    await supabase.auth.signOut();
  }, []);

  const checkSessionAge = useCallback(async () => {
    const loginTs = localStorage.getItem(LOGIN_TS_KEY);
    if (loginTs && Date.now() - Number(loginTs) > SESSION_MAX_AGE_MS) {
      await signOut();
      return true; // expired
    }
    return false;
  }, [signOut]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && !localStorage.getItem(LOGIN_TS_KEY)) {
          localStorage.setItem(LOGIN_TS_KEY, String(Date.now()));
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const expired = await checkSessionAge();
        if (!expired) {
          setSession(session);
          setUser(session.user);
        }
      }
      setLoading(false);
    });

    // Check every 5 minutes
    const interval = setInterval(() => {
      checkSessionAge();
    }, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [checkSessionAge]);

  return { user, session, loading, signOut };
};
