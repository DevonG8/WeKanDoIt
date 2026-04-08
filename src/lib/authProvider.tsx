import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "@/lib/AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthProvider: Initializing...");
        supabase.auth
            .getSession()
            .then(({ data: { session } }) => {
                console.log(
                    "AuthProvider: Initial session result:",
                    session ? "Session found" : "No session",
                );
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            })
            .catch((err) => {
                console.error("AuthProvider: Error getting session:", err);
                setLoading(false);
            });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(
                "AuthProvider: Auth state changed:",
                event,
                session ? "User logged in" : "User logged out",
            );
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            console.log("AuthProvider: Unmounting/Cleaning up subscription");
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
