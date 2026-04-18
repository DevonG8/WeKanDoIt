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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
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
    const [householdId, setHouseholdId] = useState("");
    const [loading, setLoading] = useState(false);
    const [households, setHouseholds] = useState<
        { id: string; name: string }[]
    >([]);
    // const [applianceChecked, setApplianceChecked] = useState(false);
    const [members, setMembers] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        if (!open) return;
        async function fetchHouseholds() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("households")
                    .select("id, name");
                setHouseholds(data ?? []);
            }
        }
        fetchHouseholds();
    }, [open]);

    useEffect(() => {
        if (!open || !householdId) return;
        async function fetchMembers() {
            const { data } = await supabase
                .from("household_members")
                .select("user_id, profiles(id, name)")
                .eq("household_id", householdId);
            setMembers(
                data?.flatMap((m) =>
                    Array.isArray(m.profiles)
                        ? m.profiles
                        : m.profiles
                          ? [m.profiles]
                          : [],
                ) ?? [],
            );
        }
        fetchMembers();
    }, [open, householdId]);

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
                household_id: householdId || null,
                created_by: user.id,
            });
        }
        setLoading(false);
        setTitle("");
        setDescription("");
        setDueDate("");
        setPriority("medium");
        setHouseholdId("");
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
                            <Label htmlFor="task-priority">
                                Choose Household
                            </Label>
                            <Select
                                value={householdId}
                                onValueChange={setHouseholdId}>
                                {" "}
                                <SelectTrigger id="task-household">
                                    <SelectValue placeholder="Select household" />
                                </SelectTrigger>
                                <SelectContent>
                                    {households.map((h) => (
                                        <SelectItem
                                            key={h.id}
                                            value={h.id}>
                                            {h.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="task-priority">
                                Choose Appliance
                            </Label>
                            <FieldGroup className=" w-72">
                                <Field orientation="horizontal">
                                    <Checkbox
                                        id="terms-checkbox-desc"
                                        name="terms-checkbox-desc"
                                        defaultChecked
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor="terms-checkbox-desc">
                                            Appliance
                                        </FieldLabel>
                                        <FieldDescription>
                                            Add an appliance to this task.
                                        </FieldDescription>
                                    </FieldContent>
                                </Field>
                            </FieldGroup>
                        </div>
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
                            <Label htmlFor="task-priority">Assign To</Label>
                            <Select
                                value={householdId}
                                onValueChange={setHouseholdId}>
                                {" "}
                                <SelectTrigger id="task-household">
                                    <SelectValue placeholder="Select User" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map((member) => (
                                        <SelectItem
                                            key={member.id}
                                            value={member.id}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
