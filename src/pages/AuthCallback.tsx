import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        console.log("AuthCallback: Component mounted, waiting for auth state change...");
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("AuthCallback: Event:", event, "Session:", session ? "Active" : "Null");
            if (event === "SIGNED_IN" && session) {
                console.log("AuthCallback: Signed in successfully, navigating to /");
                navigate("/");
            } else if (event === "INITIAL_SESSION" && !session) {
                console.log("AuthCallback: No initial session found during callback, navigating back to login.");
                navigate("/login");
            }
        });

        return () => {
            console.log("AuthCallback: Cleaning up subscription");
            subscription.unsubscribe();
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground">Signing you in...</p>
        </div>
    );
}
