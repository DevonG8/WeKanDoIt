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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function TaskModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("medium");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    async function handleCreate() {
        setLoading(true);
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            await supabase.from("tasks").insert({
                title,
                description,
                due_date: dueDate || null,
                priority,
                user_id: user.id,
            });
        }
        setLoading(false);
        setTitle("");
        setDescription("");
        setDueDate("");
        setPriority("medium");
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>New Task</CardTitle>
                    <CardDescription>
                        Add a new task to your board.
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
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="task-title">Title</Label>
                            <Input
                                id="task-title"
                                placeholder="e.g. Buy groceries"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="task-description">
                                Description
                            </Label>
                            <Textarea
                                id="task-description"
                                placeholder="Add more details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="task-due-date">Due Date</Label>
                            <Input
                                id="task-due-date"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="task-priority">Priority</Label>
                            <Select
                                value={priority}
                                onValueChange={setPriority}>
                                <SelectTrigger id="task-priority">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">
                                        Medium
                                    </SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                        disabled={!title || loading}>
                        {loading ? "Creating..." : "Create"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
