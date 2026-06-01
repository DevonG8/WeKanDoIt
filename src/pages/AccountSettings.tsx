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
import ChangeAvatar from "@/components/Settings/Change-avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon } from "lucide-react";
import { DeleteTasks, DeleteAccount } from "@/components/Settings/Delete-data";

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
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = React.useState(false);

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

    const handleAvatarUpdateSuccess = (newAvatar: string) => {
        setUserData((prev) => ({ ...prev, avatar: newAvatar }));
        setIsAvatarDialogOpen(false);
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

                        {/* Username Card */}
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

                        {/* Avatar Card */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Change Profile Picture</CardTitle>
                                <CardDescription>
                                    Update your profile picture.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-20 w-20 border">
                                        <AvatarImage src={userData.avatar} />
                                        <AvatarFallback>
                                            <UserIcon size={32} />
                                        </AvatarFallback>
                                    </Avatar>

                                    <Dialog
                                        open={isAvatarDialogOpen}
                                        onOpenChange={setIsAvatarDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                Update Avatar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Update Profile Picture
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Compare your current avatar
                                                    with the new one before
                                                    saving.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ChangeAvatar
                                                currentAvatar={userData.avatar}
                                                onUpdateSuccess={
                                                    handleAvatarUpdateSuccess
                                                }
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Theme Preferences Card */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Color Preferences</CardTitle>
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
                        <div className="flex flex-col gap-4">
                            <Card className="w-full border-destructive/20 bg-destructive/5">
                                <CardHeader>
                                    <CardTitle className="text-destructive">
                                        Wipe Task Data
                                    </CardTitle>
                                    <CardDescription>
                                        Permanently delete every task you have
                                        created across all households.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DeleteTasks />
                                </CardContent>
                            </Card>

                            <Card className="w-full border-destructive/20 bg-destructive/5">
                                <CardHeader>
                                    <CardTitle className="text-destructive">
                                        Delete Account
                                    </CardTitle>
                                    <CardDescription>
                                        Permanently remove your profile and data
                                        from the platform.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DeleteAccount />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </SidebarProvider>
    );
}
