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
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    if (!open) return null;

    async function handleCreate() {
        setLoading(true);
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            const inviteCode = crypto.randomUUID();
            const link = `${window.location.origin}/join/${inviteCode}`;

            const { error } = await supabase
                .from("households")
                .insert({ name, created_by: user.id, invite_code: inviteCode });

            if (error) {
                console.error("Failed to create household:", error.message);
                setLoading(false);
                return;
            }

            setInviteLink(link);
        }

        setLoading(false);
    }

    function handleCopy() {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function handleClose() {
        setName("");
        setInviteLink(null);
        setCopied(false);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>
                        {inviteLink ? "Household Created!" : "New Household"}
                    </CardTitle>
                    <CardDescription>
                        {inviteLink
                            ? "Share this link to invite members to your household."
                            : "Create a new household and start organizing!"}
                    </CardDescription>
                    <CardAction>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}>
                            ✕
                        </Button>
                    </CardAction>
                </CardHeader>

                {inviteLink ? (
                    <>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <Label>Invite Link</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={inviteLink}
                                        readOnly
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={handleCopy}>
                                        {copied ? "Copied!" : "Copy"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={handleClose}>Done</Button>
                        </CardFooter>
                    </>
                ) : (
                    <>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="household-name">
                                    Household Name
                                </Label>
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
                                onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={!name || loading}>
                                {loading ? "Creating..." : "Create"}
                            </Button>
                        </CardFooter>
                    </>
                )}
            </Card>
        </div>
    );
}
