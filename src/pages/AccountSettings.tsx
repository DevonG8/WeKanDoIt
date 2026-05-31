import * as React from "react";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/components/theme-context";
import { AppSidebar } from "@/components/navbar/NavBar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function AccountSettings() {
    const { theme, setTheme } = useTheme();
    const [selectedHouseholdId, setSelectedHouseholdId] = React.useState<
        string | null
    >(null);

    // Map theme values to display labels
    const themeLabels: Record<string, string> = {
        light: "Light Mode",
        dark: "Dark Mode",
        system: "Auto (System Default)",
    };

    return (
        <SidebarProvider>
            <AppSidebar
                selectedHouseholdId={selectedHouseholdId}
                onSelectHousehold={setSelectedHouseholdId}
            />
            <main className="relative flex min-h-screen w-full flex-col p-4 md:p-8">
                <div className="absolute left-4 top-4">
                    <SidebarTrigger />
                </div>

                <div className="w-full">
                    <div className="mt-4 w-full rounded-lg border p-2 shadow">
                        <h1 className="text-2xl font-bold mb-4">
                            Account Settings
                        </h1>
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>color Preferences</CardTitle>
                                <CardDescription>
                                    Set your preferred color scheme for the
                                    application.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            {themeLabels[theme || "system"]}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuRadioGroup
                                            value={theme || "system"}
                                            onValueChange={(value) =>
                                                setTheme(value as Theme)
                                            }>
                                            <DropdownMenuLabel>
                                                Color options
                                            </DropdownMenuLabel>
                                            <DropdownMenuRadioItem value="system">
                                                Auto (System Default)
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="light">
                                                Light Mode
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="dark">
                                                Dark Mode
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardContent>
                        </Card>
                        {/* add account name change, profile picture, blocking/unadding, wipe all tasks button */}
                    </div>
                </div>
            </main>
        </SidebarProvider>
    );
}
