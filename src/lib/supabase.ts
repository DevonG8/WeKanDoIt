import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Safety check: if these are missing, the app crashes on load
if (!supabaseUrl || !supabaseKey) {
    console.error(
        "Supabase environment variables are missing! Check your .env file.",
    );
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");
