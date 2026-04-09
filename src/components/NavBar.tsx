import * as React from "react";
import { useEffect, useState } from "react";

import { Calendars } from "@/components/calendars";
import { DatePicker } from "@/components/date-picker";
import { NavUser } from "@/components/nav-user";
import { TaskModal } from "@/components/task-modal";
import { HouseholdModal } from "@/components/household-modal";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusIcon } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [userData, setUserData] = useState({
        name: "Loading...",
        email: "",
        avatar: "",
    });

    const [calendarData, setCalendarData] = useState([
        {
            name: "Board View",
            items: ["Board", "My Tasks", "Calendar"],
        },
        {
            name: "Households",
            items: [] as string[],
        },
    ]);

    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [householdModalOpen, setHouseholdModalOpen] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();
            if (authError || !user) return;

            const { data: profile } = await supabase
                .from("profiles")
                .select("name, email, picture")
                .eq("id", user.id)
                .single();

            if (profile) {
                setUserData({
                    name: profile.name || "User",
                    email: profile.email || user.email || "",
                    avatar: profile.picture || "",
                });
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function fetchCalendars() {
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();
            if (authError || !user) return;

            const { data: households, error: dbError } = await supabase
                .from("households")
                .select("name")
                .eq("user_id", user.id);

            if (dbError || !households) return;

            if (!cancelled) {
                setCalendarData((prev) =>
                    prev.map((cal) =>
                        cal.name === "Households"
                            ? { ...cal, items: households.map((h) => h.name) }
                            : cal,
                    ),
                );
            }
        }

        fetchCalendars();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <Sidebar {...props}>
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <NavUser user={userData} />
            </SidebarHeader>
            <SidebarContent>
                <DatePicker />
                <SidebarSeparator className="mx-0" />
                <Calendars calendars={calendarData} />
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <PlusIcon />
                                    <span>New</span>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-48">
                                <DropdownMenuItem
                                    onSelect={() => setTaskModalOpen(true)}>
                                    New Task
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() =>
                                        setHouseholdModalOpen(true)
                                    }>
                                    New Household
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <TaskModal
                open={taskModalOpen}
                onClose={() => setTaskModalOpen(false)}
            />
            <HouseholdModal
                open={householdModalOpen}
                onClose={() => setHouseholdModalOpen(false)}
            />

            <SidebarRail />
        </Sidebar>
    );
}
