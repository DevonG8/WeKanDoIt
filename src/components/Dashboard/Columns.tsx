import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
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
import { useAnimateCards } from "@/hooks/useTaskCards";
import gsap from "gsap";

interface ColumnsProps {
    householdId: string | null;
    children?: React.ReactNode;
}

export function Columns({ householdId }: ColumnsProps) {
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Tracks if we are currently running an exit transition
    const [isTransitioning, setIsTransitioning] = useState(false);

    const prevHouseholdId = useRef<string | null>(null);

    const {
        cardsRef: backlogCardsRef,
        triggerAnimation: animateBacklog,
        triggerReverseAnimation: reverseBacklog,
    } = useAnimateCards();

    const {
        cardsRef: nextCardsRef,
        triggerAnimation: animateNext,
        triggerReverseAnimation: reverseNext,
    } = useAnimateCards();

    const {
        cardsRef: inProgressCardsRef,
        triggerAnimation: animateInProgress,
        triggerReverseAnimation: reverseInProgress,
    } = useAnimateCards();

    const {
        cardsRef: pendingCardsRef,
        triggerAnimation: animatePending,
        triggerReverseAnimation: reversePending,
    } = useAnimateCards();

    const {
        cardsRef: finishedCardsRef,
        triggerAnimation: animateFinished,
        triggerReverseAnimation: reverseFinished,
    } = useAnimateCards();

    //  Column open/close hooks
    const {
        columnRef: backlogRef,
        toggleColumn: toggleBacklog,
        isOpen: backlogOpen,
    } = useAnimatedColumn(animateBacklog);
    const {
        columnRef: nextRef,
        toggleColumn: toggleNext,
        isOpen: nextOpen,
    } = useAnimatedColumn(animateNext, true);
    const {
        columnRef: inProgressRef,
        toggleColumn: toggleInProgress,
        isOpen: inProgressOpen,
    } = useAnimatedColumn(animateInProgress, true);
    const {
        columnRef: pendingRef,
        toggleColumn: togglePending,
        isOpen: pendingOpen,
    } = useAnimatedColumn(animatePending, true);
    const {
        columnRef: finishedRef,
        toggleColumn: toggleFinished,
        isOpen: finishedOpen,
    } = useAnimatedColumn(animateFinished);

    //  Fetch tasks
    useEffect(() => {
        async function fetchTasks() {
            if (!householdId) {
                setTasks([]);
                return;
            }

            const isSwitch =
                prevHouseholdId.current !== null &&
                prevHouseholdId.current !== householdId;

            if (isSwitch) {
                setIsTransitioning(true);
                await new Promise<void>((resolve) => {
                    const runners: Array<(cb: () => void) => void> = [];
                    if (backlogOpen) runners.push(reverseBacklog);
                    if (nextOpen) runners.push(reverseNext);
                    if (inProgressOpen) runners.push(reverseInProgress);
                    if (pendingOpen) runners.push(reversePending);
                    if (finishedOpen) runners.push(reverseFinished);

                    if (!runners.length) {
                        resolve();
                        return;
                    }

                    let pending = runners.length;
                    const done = () => {
                        if (--pending === 0) resolve();
                    };
                    runners.forEach((fn) => fn(done));
                });
            }

            prevHouseholdId.current = householdId;
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
            setIsTransitioning(false); // Transitions are complete
        }

        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [householdId]);

    useEffect(() => {
        if (loading || isTransitioning) return;

        const timer = setTimeout(() => {
            const ctx = gsap.context(() => {
                if (backlogOpen) animateBacklog();
                if (nextOpen) animateNext();
                if (inProgressOpen) animateInProgress();
                if (pendingOpen) animatePending();
                if (finishedOpen) animateFinished();
            });
            return () => ctx.revert();
        }, 30);

        return () => clearTimeout(timer);
    }, [tasks, loading, isTransitioning]);

    const handleDragOver = (
        ref: React.RefObject<HTMLDivElement | null>,
        e: React.DragEvent<HTMLDivElement>,
    ) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (ref.current) {
            const { top, bottom } = ref.current.getBoundingClientRect();
            if (e.clientY - top < 50) ref.current.scrollTop -= 5;
            else if (bottom - e.clientY < 50) ref.current.scrollTop += 5;
        }
    };

    const handleDrop =
        (newStatus: TaskStatus) =>
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData("taskId");
            if (!taskId) return;

            const { error } = await supabase
                .from("tasks")
                .update({ status: newStatus })
                .eq("id", taskId);

            if (error) {
                console.error("Error updating task:", error);
            } else {
                setTasks((prev) =>
                    prev.map((task) =>
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

    const columnWrap = (isOpen: boolean) =>
        `relative h-[80vh] transition-all duration-500 ease-in-out overflow-hidden rounded-xl border bg-card ${
            isOpen ? "flex-1 min-w-0" : "w-10 flex-none"
        }`;

    const columnInner = (isOpen: boolean) =>
        `flex flex-col h-full ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`;

    return (
        <div className="flex gap-2 sm:gap-4 w-full items-start">
            {/* ── Backlog ─────────────────────────────────────────────────── */}
            <div className={columnWrap(backlogOpen)}>
                {!backlogOpen && (
                    <button
                        onClick={toggleBacklog}
                        className="absolute inset-0 flex items-center justify-center w-full h-full hover:bg-muted transition-colors group bg-primary">
                        <span className="-rotate-90 whitespace-nowrap text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                            Backlog ({backlogTasks.length}){" "}
                            {loading ? "Getting Tasks..." : "Tasks"}
                        </span>
                    </button>
                )}
                <div
                    ref={backlogRef}
                    className={columnInner(backlogOpen)}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Backlog</CardTitle>
                                <CardDescription className="mt-1">
                                    Tasks you have not yet started.
                                </CardDescription>
                            </div>
                            <button
                                onClick={toggleBacklog}
                                className="...">
                                <span>...</span>
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent
                        ref={backlogCardsRef}
                        className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-full"
                        onDragOver={(e) => handleDragOver(backlogRef, e)}
                        onDragLeave={(e) => e.preventDefault()}
                        onDrop={handleDrop(TaskStatus.backlog)}>
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

            {/* ── Next ────────────────────────────────────────────────────── */}
            <div className={columnWrap(nextOpen)}>
                {!nextOpen && (
                    <button
                        onClick={toggleNext}
                        className="absolute inset-0 flex items-center justify-center w-full h-full hover:bg-muted transition-colors group bg-primary">
                        <span className="-rotate-90 whitespace-nowrap text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                            Next ({nextTasks.length}){" "}
                            {loading ? "Getting Tasks..." : "Tasks"}
                        </span>
                    </button>
                )}
                <div
                    ref={nextRef}
                    className={columnInner(nextOpen)}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Next</CardTitle>
                                <CardDescription className="mt-1">
                                    Your Next tasks to do!
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleNext}>
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent
                        ref={nextCardsRef}
                        className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-full"
                        onDragOver={(e) => handleDragOver(nextRef, e)}
                        onDragLeave={(e) => e.preventDefault()}
                        onDrop={handleDrop(TaskStatus.next)}>
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

            {/* ── In Progress ─────────────────────────────────────────────── */}
            <div className={columnWrap(inProgressOpen)}>
                {!inProgressOpen && (
                    <button
                        onClick={toggleInProgress}
                        className="absolute inset-0 flex items-center justify-center w-full h-full hover:bg-muted transition-colors group bg-primary">
                        <span className="-rotate-90 whitespace-nowrap text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                            In Progress ({inProgressTasks.length}){" "}
                            {loading ? "Getting Tasks..." : "Tasks"}
                        </span>
                    </button>
                )}
                <div
                    ref={inProgressRef}
                    className={columnInner(inProgressOpen)}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>In Progress</CardTitle>
                                <CardDescription className="mt-1">
                                    Your In Progress tasks!
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleInProgress}>
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent
                        ref={inProgressCardsRef}
                        className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-full"
                        onDragOver={(e) => handleDragOver(inProgressRef, e)}
                        onDragLeave={(e) => e.preventDefault()}
                        onDrop={handleDrop(TaskStatus.inProgress)}>
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

            {/* ── Pending Review ──────────────────────────────────────────── */}
            <div className={columnWrap(pendingOpen)}>
                {!pendingOpen && (
                    <button
                        onClick={togglePending}
                        className="absolute inset-0 flex items-center justify-center w-full h-full hover:bg-muted transition-colors group bg-primary">
                        <span className="-rotate-90 whitespace-nowrap text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                            Pending Review ({pendingTasks.length}){" "}
                            {loading ? "Getting Tasks..." : "Tasks"}
                        </span>
                    </button>
                )}
                <div
                    ref={pendingRef}
                    className={columnInner(pendingOpen)}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Pending Review</CardTitle>
                                <CardDescription className="mt-1">
                                    Your tasks pending review!
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePending}>
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent
                        ref={pendingCardsRef}
                        className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-full"
                        onDragOver={(e) => handleDragOver(pendingRef, e)}
                        onDragLeave={(e) => e.preventDefault()}
                        onDrop={handleDrop(TaskStatus.pending)}>
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

            {/* ── Finished ────────────────────────────────────────────────── */}
            <div className={columnWrap(finishedOpen)}>
                {!finishedOpen && (
                    <button
                        onClick={toggleFinished}
                        className="absolute inset-0 flex items-center justify-center w-full h-full hover:bg-muted transition-colors group bg-primary">
                        <span className="-rotate-90 whitespace-nowrap text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                            Finished ({finishedTasks.length}){" "}
                            {loading ? "Getting Tasks..." : "Tasks"}
                        </span>
                    </button>
                )}
                <div
                    ref={finishedRef}
                    className={columnInner(finishedOpen)}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Finished</CardTitle>
                                <CardDescription className="mt-1">
                                    Your Finished tasks!
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleFinished}>
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent
                        ref={finishedCardsRef}
                        className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-full"
                        onDragOver={(e) => handleDragOver(finishedRef, e)}
                        onDragLeave={(e) => e.preventDefault()}
                        onDrop={handleDrop(TaskStatus.finished)}>
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

            {/* ── Task detail modal ────────────────────────────────────────── */}
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
