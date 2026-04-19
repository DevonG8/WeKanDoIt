"use client";

import * as React from "react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { CaretRightIcon, CheckIcon } from "@phosphor-icons/react";

export interface Household {
    id: string;
    name: string;
    member_count: number;
}

interface HouseholdsProps {
    households: Household[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function Households({ households, selectedId, onSelect }: HouseholdsProps) {
    return (
        <>
            <SidebarGroup>
                <Collapsible
                    defaultOpen
                    className="group/collapsible">
                    <SidebarGroupLabel
                        asChild
                        className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                        <CollapsibleTrigger>
                            Households
                            <CaretRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {households.map((household) => (
                                    <SidebarMenuItem key={household.id}>
                                        <SidebarMenuButton
                                            isActive={selectedId === household.id}
                                            onClick={() => onSelect(household.id)}>
                                            <div className="group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground">
                                                {selectedId === household.id && (
                                                    <CheckIcon className="size-3" />
                                                )}
                                            </div>
                                            <span className="truncate">
                                                {household.name}
                                            </span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                                {households.length === 0 && (
                                    <div className="px-4 py-2 text-xs text-muted-foreground italic">
                                        No households found
                                    </div>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarGroup>
            <SidebarSeparator className="mx-0" />
        </>
    );
}
