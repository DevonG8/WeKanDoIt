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

export function HouseholdModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    async function handleCreate() {
        setLoading(true);
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from("households")
                .insert({ name, created_by: user.id });
        }
        console.log("Household created:", name);
        setLoading(false);
        setName("");
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
