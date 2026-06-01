import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

interface ChangeUserProps {
    currentName: string;
    onUpdateSuccess: (newName: string) => void;
}

export default function ChangeUser({ currentName, onUpdateSuccess }: ChangeUserProps) {
    const { user } = useAuth();
    const [newName, setNewName] = useState(currentName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newName.trim()) return;
        if (newName === currentName) {
            setError("New username must be different from current one.");
            return;
        }

        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
            .from("profiles")
            .update({ name: newName })
            .eq("id", user.id);

        if (updateError) {
            console.error("Error updating username:", updateError);
            setError(updateError.message);
        } else {
            onUpdateSuccess(newName);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Field>
                <FieldLabel htmlFor="new-username">New Username</FieldLabel>
                <Input
                    id="new-username"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter your new username"
                    required
                />
                <FieldDescription>
                    Choose a new username for your account. This will update your initials as well.
                </FieldDescription>
            </Field>

            {error && (
                <p className="text-sm text-destructive font-medium">
                    {error}
                </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update Username"}
            </Button>
        </form>
    );
}
