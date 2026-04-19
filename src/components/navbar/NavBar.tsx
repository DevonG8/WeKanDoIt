"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Households, type Household } from "@/components/navbar/HouseholdList";
import { DatePicker } from "@/components/navbar/date-picker";
import { NavUser } from "@/components/navbar/nav-user";
import { TaskModal } from "@/components/navbar/task-modal";
import { HouseholdModal } from "@/components/navbar/household-modal";
import { JoinHouseholdModal } from "@/components/navbar/join-household-modal";

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

interface HouseholdMemberResponse {
    households: {
        id: string;
        name: string;
        household_members: { user_id: string }[];
    } | null;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    selectedHouseholdId: string | null;
    onSelectHousehold: (id: string | null) => void;
}

export function AppSidebar({
    selectedHouseholdId,
    onSelectHousehold,
    ...props
}: AppSidebarProps) {
    const [userData, setUserData] = useState({
        name: "Loading...",
        email: "",
        avatar: "",
    });

    const [households, setHouseholds] = useState<Household[]>([]);

    // Modal states
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [householdModalOpen, setHouseholdModalOpen] = useState(false);
    const [joinHouseholdModalOpen, setJoinHouseholdModalOpen] = useState(false);

    //gettings households for dropdown
    const fetchHouseholds = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("household_members")
            .select(
                `
        households (
          id,
          name,
          household_members ( user_id )
        )
      `,
            )
            .eq("user_id", user.id);

        if (error) {
            console.error("Error fetching households:", error);
            return;
        }

        const typedData = data as unknown as HouseholdMemberResponse[];

        const mapped: Household[] = typedData
            .filter((row) => row.households !== null)
            .map((row) => ({
                id: row.households!.id,
                name: row.households!.name,
                member_count: row.households!.household_members.length,
            }));

        setHouseholds(mapped);

        if (mapped.length > 0 && !selectedHouseholdId) {
            onSelectHousehold(mapped[0].id);
        } else if (mapped.length > 0 && selectedHouseholdId) {
            if (!mapped.some((h) => h.id === selectedHouseholdId)) {
                onSelectHousehold(mapped[0].id);
            }
        } else if (mapped.length === 0) {
            onSelectHousehold(null);
        }
    }, [selectedHouseholdId, onSelectHousehold]);

    useEffect(() => {
        async function init() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

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
            fetchHouseholds();
        }
        init();
    }, [fetchHouseholds]);

    return (
        <Sidebar {...props}>
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <NavUser user={userData} />
            </SidebarHeader>

            <SidebarContent>
                <DatePicker />
                <SidebarSeparator className="mx-0" />
                <Households
                    households={households}
                    selectedId={selectedHouseholdId}
                    onSelect={onSelectHousehold}
                />
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
                                <DropdownMenuItem
                                    onSelect={() =>
                                        setJoinHouseholdModalOpen(true)
                                    }>
                                    Join Household
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            {/* Modals */}
            <TaskModal
                open={taskModalOpen}
                onClose={() => setTaskModalOpen(false)}
            />
            <HouseholdModal
                open={householdModalOpen}
                onClose={() => {
                    setHouseholdModalOpen(false);
                    fetchHouseholds();
                }}
            />
            <JoinHouseholdModal
                open={joinHouseholdModalOpen}
                onClose={() => {
                    setJoinHouseholdModalOpen(false);
                    fetchHouseholds();
                }}
            />
            <SidebarRail />
        </Sidebar>
    );
}
