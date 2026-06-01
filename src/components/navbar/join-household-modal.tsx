import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function JoinHouseholdModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [name, setName] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!open) return null;

    async function addToHousehold() {
        if (!name && !link) return;
        setError("");
        setLoading(true);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            let householdQuery = supabase.from("households").select("id");

            if (link) {
                householdQuery = householdQuery.eq("invite_code", link);
            } else {
                householdQuery = householdQuery.ilike("name", name);
            }

            const { data: household, error: householdError } =
                await householdQuery.single();

            if (householdError || !household) {
                setError("No household found with that name or link.");
                return;
            }

            const { data: existing } = await supabase
                .from("household_members")
                .select("id")
                .eq("household_id", household.id)
                .eq("user_id", user.id)
                .single();

            if (existing) {
                setError("You're already a member of this household.");
                return;
            }

            const { error: insertError } = await supabase
                .from("household_members")
                .insert({
                    household_id: household.id,
                    user_id: user.id,
                });

            if (insertError) throw insertError;

            onClose();
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Join Household</CardTitle>
                    <CardDescription>
                        Join an existing household and start organizing!
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
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="household-name">Household Name</Label>
                        <Input
                            id="household-name"
                            placeholder="e.g. Smiths Household"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">
                            OR
                        </span>
                        <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="household-link">Invite Code</Label>
                        <Input
                            id="household-link"
                            placeholder="e.g. abc-123-xyz"
                            value={link}
                            onChange={(e) => {
                                setLink(e.target.value);
                                setError("");
                            }}
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={addToHousehold}
                        disabled={loading || (!name && !link)}>
                        {loading ? "Adding..." : "Add to Household"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
