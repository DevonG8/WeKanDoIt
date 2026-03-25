import { supabase } from "./supabase";
import { ApiError } from "./errors";

export async function getUser(req: Request) {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError("Unauthorized", 401);

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    if (error || !user) throw new ApiError("Unauthorized", 401);

    return user;
}
