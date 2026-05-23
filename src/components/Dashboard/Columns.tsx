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
                .select(
                    `
                    *,
                    profiles:assigned_to (
                        name
                    )
                `,
                )
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

    const handleDragOver = (
        ref: React.RefObject<HTMLDivElement | null>,
        e: React.DragEvent<HTMLDivElement>,
    ) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        if (ref.current) {
            const scrollSpeed = 5;
            const { top, bottom } = ref.current.getBoundingClientRect();

            if (e.clientY - top < 50) {
                ref.current.scrollTop -= scrollSpeed;
            } else if (bottom - e.clientY < 50) {
                ref.current.scrollTop += scrollSpeed;
            }
        }
    };

    const handleDrop =
        (newStatus: TaskStatus) =>
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData("taskId");

            if (!taskId) return;

            // Update task
            const { error } = await supabase
                .from("tasks")
                .update({ status: newStatus })
                .eq("id", taskId);

            if (error) {
                console.error("Error updating task:", error);
            } else {
                // Update local
                setTasks(
                    tasks.map((task) =>
                        task.id === taskId
                            ? { ...task, status: newStatus }
                            : task,
                    ),
                );
            }
        };

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

                    <CardContent
                        className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-full"
                        onDragOver={(e) => handleDragOver(backlogRef, e)}
                        onDragLeave={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(TaskStatus.backlog)(e)}>
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

                    <CardContent
                        className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-full"
                        onDragOver={(e) => handleDragOver(nextRef, e)}
                        onDragLeave={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(TaskStatus.next)(e)}>
                        {nextTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No items yet.
                            </p>
                        ) : (
                            nextTasks.map((task) => (
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

                    <CardContent
                        className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-full"
                        onDragOver={(e) => handleDragOver(inProgressRef, e)}
                        onDragLeave={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(TaskStatus.inProgress)(e)}>
                        {inProgressTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No items yet.
                            </p>
                        ) : (
                            inProgressTasks.map((task) => (
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

                    <CardContent
                        className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-full"
                        onDragOver={(e) => handleDragOver(pendingRef, e)}
                        onDragLeave={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(TaskStatus.pending)(e)}>
                        {pendingTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No items yet.
                            </p>
                        ) : (
                            pendingTasks.map((task) => (
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

                    <CardContent
                        className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-full"
                        onDragOver={(e) => handleDragOver(finishedRef, e)}
                        onDragLeave={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(TaskStatus.finished)(e)}>
                        {finishedTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No items yet.
                            </p>
                        ) : (
                            finishedTasks.map((task) => (
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
