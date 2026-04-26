import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, ClockIcon, FlagIcon } from "lucide-react";
import type { Task } from "@/types/index";
import { TaskPriority } from "@/types/index";

const priorityLabel: Record<number, string> = {
    [TaskPriority.Low]: "Low",
    [TaskPriority.Medium]: "Medium",
    [TaskPriority.High]: "High",
    [TaskPriority.Urgent]: "Urgent",
};

const priorityVariant: Record<
    TaskPriority,
    "default" | "secondary" | "destructive" | "outline"
> = {
    [TaskPriority.Low]: "secondary",
    [TaskPriority.Medium]: "default",
    [TaskPriority.High]: "destructive",
    [TaskPriority.Urgent]: "destructive",
};

interface TaskModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ClickedTaskCard({ task, isOpen, onClose }: TaskModalProps) {
    if (!task) return null;

    const formattedDate = task.due_date
        ? new Date(task.due_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
          })
        : null;

    const isOverdue = task.due_date
        ? new Date(task.due_date) < new Date()
        : false;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <DialogTitle className="text-2xl font-bold pr-8">
                            {task.title}
                        </DialogTitle>
                        <Badge
                            variant={priorityVariant[task.priority]}
                            className="shrink-0">
                            <FlagIcon
                                size={14}
                                className="mr-1"
                            />
                            {priorityLabel[task.priority]}
                        </Badge>
                    </div>
                    {task.description && (
                        <DialogDescription className="text-base mt-4 whitespace-pre-wrap">
                            {task.description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="mt-6 space-y-4">
                    {/* Task Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Due Date */}
                        {formattedDate && (
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <CalendarIcon size={16} />
                                    Due Date
                                </div>
                                <div
                                    className={`text-base font-medium ${
                                        isOverdue
                                            ? "text-destructive"
                                            : "text-foreground"
                                    }`}>
                                    {formattedDate}
                                    {isOverdue && (
                                        <Badge
                                            variant="destructive"
                                            className="ml-2 text-xs">
                                            Overdue
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Assigned To */}
                        {task.assigned_to && (
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <UserIcon size={16} />
                                    Assigned To
                                </div>
                                <div className="text-base font-medium">
                                    {task.assigned_to}
                                </div>
                            </div>
                        )}

                        {/* Created Date */}
                        {task.created_at && (
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <ClockIcon size={16} />
                                    Created
                                </div>
                                <div className="text-base text-muted-foreground">
                                    {new Date(
                                        task.created_at,
                                    ).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Status */}
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                                Status
                            </div>
                            <Badge
                                variant="outline"
                                className="text-base">
                                {task.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Additional sections you can add */}
                    {/* 
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium mb-2">Comments</h3>
                        // Add comments section
                    </div>
                    
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium mb-2">Attachments</h3>
                        // Add attachments section
                    </div>
                    */}
                </div>

                {/* Action buttons section - customize as needed */}
                {/* 
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button>Edit Task</Button>
                </div>
                */}
            </DialogContent>
        </Dialog>
    );
}
