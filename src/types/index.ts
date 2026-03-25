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

// values for TaskStatus and TaskPriority
export const TaskStatus = {
    Pending: 0,
    InProgress: 1,
    Completed: 2,
    Cancelled: 3,
    Archived: 4,
} as const;

export const TaskPriority = {
    Low: 0,
    Medium: 1,
    High: 2,
    Urgent: 3,
} as const;

export const ApplianceStatus = {
    Available: 0,
    InUse: 1,
} as const;

// gives type of objects
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];
export type ApplianceStatus =
    (typeof ApplianceStatus)[keyof typeof ApplianceStatus];
