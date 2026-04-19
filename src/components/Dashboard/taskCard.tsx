import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon } from "lucide-react";
import type { Task } from "@/types/index";
import { TaskPriority } from "@/types/index";

const priorityLabel: Record<number, string> = {
    [TaskPriority.Low]: "Low",
    [TaskPriority.Medium]: "Medium",
    [TaskPriority.High]: "High",
    [TaskPriority.Urgent]: "Urgent",
};

const priorityVariant: Record<
    number,
    "default" | "secondary" | "destructive" | "outline"
> = {
    [TaskPriority.Low]: "secondary",
    [TaskPriority.Medium]: "default",
    [TaskPriority.High]: "destructive",
    [TaskPriority.Urgent]: "destructive",
};

export function TaskCard({ task }: { task: Task }) {
    const formattedDate = task.due_date
        ? new Date(task.due_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
          })
        : null;

    const isOverdue = task.due_date
        ? new Date(task.due_date) < new Date()
        : false;

    return (
        <Card className="w-full shadow-none hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="p-3 pb-0">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-tight">
                        {task.title}
                    </CardTitle>
                    <Badge
                        variant={priorityVariant[task.priority]}
                        className="shrink-0 text-xs">
                        {priorityLabel[task.priority]}
                    </Badge>
                </div>
                {task.description && (
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                        {task.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="p-3 pt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {formattedDate && (
                        <span
                            className={`flex items-center gap-1 ${
                                isOverdue ? "text-destructive" : ""
                            }`}>
                            <CalendarIcon size={12} />
                            {isOverdue ? "Overdue · " : ""}
                            {formattedDate}
                        </span>
                    )}
                    {task.assigned_to && (
                        <span className="flex items-center gap-1">
                            <UserIcon size={12} />
                            Assigned
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
