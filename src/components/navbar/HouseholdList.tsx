"use client";

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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    CaretRightIcon,
    CheckIcon,
    DotsThreeIcon,
    CopyIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    DeleteHouseholdTasks,
    DeleteHousehold,
} from "@/components/navbar/DeleteHouseholdData";

export interface Household {
    id: string;
    name: string;
    member_count: number;
    invite_code?: string;
}

interface HouseholdsProps {
    households: Household[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onNavigate?: (id: string) => void;
    onDelete?: (id: string) => void;
    onWipeTasks?: (id: string) => void;
}

function HouseholdItem({
    household,
    isSelected,
    onSelect,
    onNavigate,
    onDelete,
    onWipeTasks,
}: {
    household: Household;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onNavigate?: (id: string) => void;
    onDelete?: (id: string) => void;
    onWipeTasks?: (id: string) => void;
}) {
    const [copied, setCopied] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);

    function handleCopy() {
        if (household.invite_code) {
            navigator.clipboard.writeText(household.invite_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <SidebarMenuItem>
            <div className="flex items-center w-full group/item">
                <SidebarMenuButton
                    isActive={isSelected}
                    onClick={() => {
                        onSelect(household.id);
                        onNavigate?.(household.id);
                    }}
                    className="flex-1 min-w-0">
                    <div
                        className={cn(
                            "flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground transition-colors",
                            isSelected &&
                                "bg-sidebar-primary border-sidebar-primary",
                        )}>
                        {isSelected && <CheckIcon className="size-3" />}
                    </div>
                    <span className="truncate">{household.name}</span>
                </SidebarMenuButton>

                <Popover
                    open={popoverOpen}
                    onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "size-6 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity mr-1",
                                popoverOpen && "opacity-100",
                            )}
                            onClick={(e) => e.stopPropagation()}>
                            <DotsThreeIcon className="size-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="right"
                        align="start"
                        className="w-56 p-2">
                        <div className="flex flex-col gap-1">
                            {/* Invite code section */}
                            <p className="text-xs font-medium text-muted-foreground px-2 pt-1 pb-0.5">
                                Invite Code
                            </p>
                            <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1.5">
                                <code className="flex-1 text-xs font-mono truncate text-foreground">
                                    {household.invite_code ?? "No code set"}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-5 shrink-0"
                                    onClick={handleCopy}
                                    disabled={!household.invite_code}>
                                    <CopyIcon
                                        className={cn(
                                            "size-3",
                                            copied && "text-green-500",
                                        )}
                                    />
                                </Button>
                            </div>

                            <Separator className="my-1" />

                            {/* Actions */}
                            <DeleteHouseholdTasks
                                householdId={household.id}
                                onComplete={() => {
                                    setPopoverOpen(false);
                                    onWipeTasks?.(household.id);
                                }}
                            />

                            <DeleteHousehold
                                householdId={household.id}
                                onComplete={() => {
                                    setPopoverOpen(false);
                                    onDelete?.(household.id);
                                }}
                            />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </SidebarMenuItem>
    );
}

export function Households({
    households,
    selectedId,
    onSelect,
    onNavigate,
    onDelete,
    onWipeTasks,
}: HouseholdsProps) {
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
                                    <HouseholdItem
                                        key={household.id}
                                        household={household}
                                        isSelected={selectedId === household.id}
                                        onSelect={onSelect}
                                        onNavigate={onNavigate}
                                        onDelete={onDelete}
                                        onWipeTasks={onWipeTasks}
                                    />
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
