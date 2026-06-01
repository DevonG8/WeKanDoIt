import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export function DeleteTasks({ onComplete }: { onComplete?: () => void }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("created_by", user.id);

            if (error) throw error;

            setOpen(false);
            onComplete?.();
        } catch (err) {
            console.error("Error deleting tasks:", err);
            alert("Failed to delete tasks. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    className="w-fit">
                    Wipe All Tasks
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertTriangle size={20} />
                        <DialogTitle>Wipe All Tasks?</DialogTitle>
                    </div>
                    <DialogDescription>
                        This will permanently delete every task you have created
                        across all households. This action is irreversible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}>
                        {loading ? "Deleting..." : "Yes, Delete Everything"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function DeleteAccount() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { error: profileError } = await supabase
                .from("profiles")
                .delete()
                .eq("id", user.id);

            if (profileError) throw profileError;

            await supabase.auth.signOut();

            navigate("/");
        } catch (err) {
            console.error("Error deleting account:", err);
            alert(
                "Failed to delete account. You might need to log in again to perform this sensitive action.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    className="w-fit">
                    Delete My Account
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertTriangle size={24} />
                        <DialogTitle>Delete your account?</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        We are sorry to see you go. This will permanently delete
                        your profile, settings, and access to all households.
                        <strong> This cannot be undone.</strong>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}>
                        {loading
                            ? "Deleting Account..."
                            : "Confirm Account Deletion"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
