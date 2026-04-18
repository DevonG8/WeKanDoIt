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
    const [loading, setLoading] = useState(false);
    const [link, setLink] = useState("");
    const inviteCode = crypto.randomUUID();

    if (!open) return null;

    async function addToHousehold() {
        setLoading(true);
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from("household_members")
                .insert({
                    household_id: "household-id",
                    user_id: user.id,
                    invite_code: inviteCode,
                })
                .select()
                .single();
            if (error) {
                console.error("Error adding user:", error);
            } else {
                console.log("User added:", data);
            }
        }
        setLoading(false);
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
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="or-separator "> OR </Label>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="household-link">Household Link</Label>
                        <Input
                            id="household-link"
                            placeholder="e.g. john-doe-household"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={addToHousehold}
                        disabled={loading}>
                        {loading ? "Adding..." : "Add to Household"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
