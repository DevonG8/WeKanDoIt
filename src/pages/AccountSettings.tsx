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
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import ChangeUser from "@/components/Settings/Change-user";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function AccountSettings() {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [selectedHouseholdId, setSelectedHouseholdId] = React.useState<
        string | null
    >(null);
    const [userData, setUserData] = React.useState({
        name: "Loading...",
        email: "",
        avatar: "",
    });

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    React.useEffect(() => {
        async function fetchProfile() {
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
        }
        fetchProfile();
    }, [user]);

    const handleUpdateSuccess = (newName: string) => {
        setUserData((prev) => ({ ...prev, name: newName }));
        setIsDialogOpen(false);
    };

    // Map theme values to display labels
    const themeLabels: Record<string, string> = {
        light: "Light Mode",
        dark: "Dark Mode",
        system: "Auto (System Default)",
    };

    const username = userData.name;

    const initials = userData.name
        ? userData.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
        : "U";

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
                    <div className="mt-4 w-full rounded-lg border p-6 shadow flex flex-col gap-6">
                        <h1 className="text-2xl font-bold mb-2">
                            Account Settings
                        </h1>
                        {/* name change */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Change Username</CardTitle>
                                <CardDescription>
                                    Update your username.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Current Username
                                        </p>
                                        <p className="text-lg">{username}</p>
                                    </div>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Initials
                                        </p>
                                        <p className="text-lg">{initials}</p>
                                    </div>

                                    <Dialog
                                        open={isDialogOpen}
                                        onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                Change Username
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Change Username
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Enter your new username
                                                    below.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ChangeUser
                                                currentName={userData.name}
                                                onUpdateSuccess={
                                                    handleUpdateSuccess
                                                }
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                        {/* addprofile picture, blocking/unadding, wipe all tasks button */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Change Profile Picture</CardTitle>
                                <CardDescription>
                                    Update your profile picture.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline">
                                    Change profile picture
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Blocked Users</CardTitle>
                                <CardDescription>
                                    Block and manage users you have blocked.
                                </CardDescription>
                            </CardHeader>
                            <CardContent></CardContent>
                        </Card>
                        {/* theme change  */}
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
                        {/* Delete Account */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Change Username</CardTitle>
                                <CardDescription>
                                    Update your username.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline">
                                    {`Delete Account ${username}`}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </SidebarProvider>
    );
}
