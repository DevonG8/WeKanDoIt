export interface User {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    created_at: string;
}

export interface Household {
    id: string;
    name: string;
    created_by: string;
    created_at: string;
}

export interface HouseholdMember {
    household_id: string;
    user_id: string;
    role: "admin" | "member";
    joined_at: string;
}

export interface Task {
    id: string;
    household_id: string;
    title: string;
    description?: string;
    assigned_to?: string;
    due_date?: string;
    completed_at?: string;
    created_by: string;
    created_at: string;
}
