import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type UserResult = {
    id: string;
    email: string;
    name: string;
};

export function HouseholdModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<UserResult[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<UserResult[]>([]);

    if (!open) return null;

    async function handleSearch(query: string) {
        setSearch(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        const { data } = await supabase
            .from("profiles")
            .select("id, email, name")
            .ilike("email", `%${query}%`)
            .limit(5);

        setSearchResults(data ?? []);
    }

    function handleSelect(user: UserResult) {
        if (!selectedMembers.find((m) => m.id === user.id)) {
            setSelectedMembers((prev) => [...prev, user]);
        }
        setSearch("");
        setSearchResults([]);
    }

    function handleRemove(id: string) {
        setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
    }

    async function handleCreate() {
        setLoading(true);
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            const { data: household } = await supabase
                .from("households")
                .insert({ name, user_id: user.id })
                .select()
                .single();

            if (household) {
                const memberRows = selectedMembers.map((m) => ({
                    household_id: household.id,
                    user_id: m.id,
                }));
                await supabase.from("household_members").insert(memberRows);
            }
        }
        setLoading(false);
        setName("");
        setSelectedMembers([]);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>New Household</CardTitle>
                    <CardDescription>
                        Create a new household and start organizing!
                    </CardDescription>
                    <CardAction>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}>
                            ✕
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="household-name">Household Name</Label>
                        <Input
                            id="household-name"
                            placeholder="e.g. Smiths Household"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <Label>Household Members</Label>
                        {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedMembers.map((m) => (
                                    <Badge
                                        key={m.id}
                                        variant="secondary"
                                        className="flex items-center gap-1">
                                        {m.email}
                                        <button
                                            onClick={() => handleRemove(m.id)}
                                            className="ml-1 hover:text-destructive">
                                            ✕
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <Combobox items={searchResults.map((u) => u.email)}>
                            <ComboboxInput
                                placeholder="Search by email..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <ComboboxContent>
                                <ComboboxEmpty>
                                    {search.length < 2
                                        ? "Type to search..."
                                        : "No users found."}
                                </ComboboxEmpty>
                                <ComboboxList>
                                    {(email) => {
                                        const user = searchResults.find(
                                            (u) => u.email === email,
                                        )!;
                                        return (
                                            <ComboboxItem
                                                key={user.id}
                                                value={email}
                                                onSelect={() =>
                                                    handleSelect(user)
                                                }>
                                                <div className="flex flex-col">
                                                    <span>{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </ComboboxItem>
                                        );
                                    }}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!name || loading}>
                        {loading ? "Creating..." : "Create"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
