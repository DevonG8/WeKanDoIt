import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/types/index";
import { TaskStatus } from "@/types/index";
import { TaskCard } from "@/components/Dashboard/taskCard";
import { ClickedTaskCard } from "@/components/Dashboard/clickedTaskCard";
import { useAnimatedColumn } from "@/hooks/useAnimateColumn";

interface ColumnsProps {
    householdId: string | null;
    children?: React.ReactNode;
}

export function Columns({ householdId }: ColumnsProps) {
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const {
        columnRef: backlogRef,
        toggleColumn: toggleBacklog,
        isOpen: backlogOpen,
    } = useAnimatedColumn();
    const {
        columnRef: nextRef,
        toggleColumn: toggleNext,
        isOpen: nextOpen,
    } = useAnimatedColumn();
    const {
        columnRef: inProgressRef,
        toggleColumn: toggleInProgress,
        isOpen: inProgressOpen,
    } = useAnimatedColumn();
    const {
        columnRef: pendingRef,
        toggleColumn: togglePending,
        isOpen: pendingOpen,
    } = useAnimatedColumn();
    const {
        columnRef: finishedRef,
        toggleColumn: toggleFinished,
        isOpen: finishedOpen,
    } = useAnimatedColumn();

    useEffect(() => {
        console.log("useEffect fired with householdId:", householdId);

        async function fetchTasks() {
            if (!householdId) {
                setTasks([]);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("household_id", householdId);

            if (error) {
                console.error("Error fetching tasks:", error);
            } else if (data) {
                setTasks(data);
            }
            setLoading(false);
        }

        fetchTasks();
    }, [householdId]);

    const backlogTasks = tasks.filter((t) => t.status === TaskStatus.backlog);
    const nextTasks = tasks.filter((t) => t.status === TaskStatus.next);
    const inProgressTasks = tasks.filter(
        (t) => t.status === TaskStatus.inProgress,
    );
    const pendingTasks = tasks.filter((t) => t.status === TaskStatus.pending);
    const finishedTasks = tasks.filter((t) => t.status === TaskStatus.finished);

    return (
        <div className="flex gap-2 sm:gap-4 w-full items-start">
            {/* Backlog Column */}
            <div
                className={`relative h-[80vh] transition-all duration-500 ease-in-out overflow-hidden rounded-xl border bg-card ${
                    backlogOpen ? "flex-1 min-w-0" : "w-10 flex-none"
                }`}>
                {!backlogOpen && (
                    <button
                        onClick={toggleBacklog}
                        className="absolute inset-0 flex items-center justify-center w-full h-full hover:bg-muted transition-colors group bg-primary">
                        <span className="-rotate-90 whitespace-nowrap text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                            {"Backlog"} ({backlogTasks.length}){" "}
                            {loading ? "Getting Tasks..." : "Tasks"}
                        </span>
                    </button>
                )}

                <div
                    ref={backlogRef}
                    className={`flex flex-col h-full transition-opacity duration-200 ${
                        backlogOpen
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{"Backlog"}</CardTitle>
                                <CardDescription className="mt-1">
                                    Tasks you have not yet started.
                                </CardDescription>
                            </div>
                            <button
                                onClick={() => toggleBacklog()}
                                className="...">
                                <span>...</span>
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto flex flex-col gap-2">
                        {backlogTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No items yet.
                            </p>
                        ) : (
                            backlogTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onTaskClick={setSelectedTask}
                                />
                            ))
                        )}
                    </CardContent>
                </div>
            </div>

            {/* Next Column */}
            <div
                className={`relative h-[80vh] transition-all duration-500 ease-in-out overflow-hidden rounded-xl border bg-card ${
                    nextOpen ? "flex-1 min-w-0" : "w-10 flex-none"
                }`}>
                {!nextOpen && (
                    <button
                        onClick={toggleNext}
                        className="absolute inset-0 flex items-center justify-center w-full h-full hover:bg-muted transition-colors group bg-primary">
                        <span className="-rotate-90 whitespace-nowrap text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                            {"Next"} ({nextTasks.length}){" "}
                            {loading ? "Getting Tasks..." : "Tasks"}
                        </span>
                    </button>
                )}

                <div
                    ref={nextRef}
                    className={`    flex flex-col h-full transition-opacity duration-200 ${
                        nextOpen
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{"Next"}</CardTitle>
                                <CardDescription className="mt-1">
                                    Your Next tasks to do!{" "}
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleNext()}>
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto flex flex-col gap-2">
                        {nextTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No items yet.
                            </p>
                        ) : (
                            nextTasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className="rounded-md border p-2 text-sm bg-background cursor-pointer hover:bg-muted transition-colors">
                                    <div className="font-semibold">
                                        {task.title}
                                    </div>
                                    {task.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </div>
            </div>

            {/* In Progress Column */}
            <div
                className={`relative h-[80vh] transition-all duration-500 ease-in-out overflow-hidden rounded-xl border bg-card ${
                    inProgressOpen ? "flex-1 min-w-0" : "w-10 flex-none"
                }`}>
                {!inProgressOpen && (
                    <button
                        onClick={toggleInProgress}
                        className="absolute inset-0 flex items-center justify-center w-full h-full hover:bg-muted transition-colors group bg-primary">
                        <span className="-rotate-90 whitespace-nowrap text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                            {"In Progress"} ({inProgressTasks.length}){" "}
                            {loading ? "Getting Tasks..." : "Tasks"}
                        </span>
                    </button>
                )}

                <div
                    ref={inProgressRef}
                    className={`flex flex-col h-full transition-opacity duration-200 ${
                        inProgressOpen
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{"In Progress"}</CardTitle>
                                <CardDescription className="mt-1">
                                    Your In Progress tasks!{" "}
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleInProgress()}>
                                {" "}
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto flex flex-col gap-2">
                        {inProgressTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No items yet.
                            </p>
                        ) : (
                            inProgressTasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className="rounded-md border p-2 text-sm bg-background cursor-pointer hover:bg-muted transition-colors">
                                    <div className="font-semibold">
                                        {task.title}
                                    </div>
                                    {task.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </div>
            </div>

            {/* Pending Column */}
            <div
                className={`relative h-[80vh] transition-all duration-500 ease-in-out overflow-hidden rounded-xl border bg-card ${
                    pendingOpen ? "flex-1 min-w-0" : "w-10 flex-none"
                }`}>
                {!pendingOpen && (
                    <button
                        onClick={togglePending}
                        className="absolute inset-0 flex items-center justify-center w-full h-full hover:bg-muted transition-colors group bg-primary">
                        <span className="-rotate-90 whitespace-nowrap text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                            {"Pending Review"} ({pendingTasks.length}){" "}
                            {loading ? "Getting Tasks..." : "Tasks"}
                        </span>
                    </button>
                )}

                <div
                    ref={pendingRef}
                    className={`flex flex-col h-full transition-opacity duration-200 ${
                        pendingOpen
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{"Pending Review"}</CardTitle>
                                <CardDescription className="mt-1">
                                    Your tasks pending review tasks!{" "}
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => togglePending()}>
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto flex flex-col gap-2">
                        {pendingTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No items yet.
                            </p>
                        ) : (
                            pendingTasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className="rounded-md border p-2 text-sm bg-background cursor-pointer hover:bg-muted transition-colors">
                                    <div className="font-semibold">
                                        {task.title}
                                    </div>
                                    {task.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </div>
            </div>

            {/* Finished Column */}
            <div
                className={`relative h-[80vh] transition-all duration-500 ease-in-out overflow-hidden rounded-xl border bg-card ${
                    finishedOpen ? "flex-1 min-w-0" : "w-10 flex-none"
                }`}>
                {!finishedOpen && (
                    <button
                        onClick={toggleFinished}
                        className="absolute inset-0 flex items-center justify-center w-full h-full hover:bg-muted transition-colors group bg-primary">
                        <span className="-rotate-90 whitespace-nowrap text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                            {"Finished"} ({finishedTasks.length}){" "}
                            {loading ? "Getting Tasks..." : "Tasks"}
                        </span>
                    </button>
                )}

                <div
                    ref={finishedRef}
                    className={`flex flex-col h-full transition-opacity duration-200 ${
                        finishedOpen
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{"Finished"}</CardTitle>
                                <CardDescription className="mt-1">
                                    Your Finished tasks!{" "}
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleFinished()}>
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto flex flex-col gap-2">
                        {finishedTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No items yet.
                            </p>
                        ) : (
                            finishedTasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className="rounded-md border p-2 text-sm bg-background cursor-pointer hover:bg-muted transition-colors">
                                    <div className="font-semibold">
                                        {task.title}
                                    </div>
                                    {task.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </div>
            </div>

            {/* ClickedTaskCard Modal */}
            {selectedTask && (
                <ClickedTaskCard
                    task={selectedTask}
                    isOpen={true}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    );
}
