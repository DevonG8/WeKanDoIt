import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
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
import { TrashIcon, BroomIcon } from "@phosphor-icons/react";

export function DeleteHouseholdTasks({
    householdId,
    onComplete,
}: {
    householdId: string;
    onComplete?: () => void;
}) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        if (!user || !householdId) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("household_id", householdId);

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
                <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors w-full text-left">
                    <BroomIcon className="size-4 text-muted-foreground" />
                    Wipe Tasks
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertTriangle size={20} />
                        <DialogTitle>Wipe All Tasks?</DialogTitle>
                    </div>
                    <DialogDescription>
                        This will permanently delete every task in this
                        household. This action is irreversible.
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
                        {loading ? "Deleting..." : "Yes, Wipe Tasks"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function DeleteHousehold({
    householdId,
    onComplete,
}: {
    householdId: string;
    onComplete?: () => void;
}) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        if (!user || !householdId) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from("households")
                .delete()
                .eq("id", householdId);

            if (error) throw error;

            setOpen(false);
            onComplete?.();
        } catch (err) {
            console.error("Error deleting household:", err);
            alert("Failed to delete household. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left text-destructive">
                    <TrashIcon className="size-4" />
                    Delete Household
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertTriangle size={24} />
                        <DialogTitle>Delete Household?</DialogTitle>
                    </div>
                    <DialogDescription>
                        This will permanently delete this household and all its
                        data. <strong>This cannot be undone.</strong>
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
                        {loading ? "Deleting..." : "Yes, Delete Household"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
