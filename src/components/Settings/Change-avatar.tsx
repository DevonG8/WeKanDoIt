import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { UserIcon } from "lucide-react";

interface ChangeAvatarProps {
    currentAvatar: string;
    onUpdateSuccess: (newAvatar: string) => void;
}

// Dicebear stuff
const generateSeed = () => Math.random().toString(36).substring(7);

const generateIdenticonOptions = (count: number) =>
    Array.from({ length: count }).map(() => {
        const seed = generateSeed();
        return {
            seed,
            url: `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`,
        };
    });

export default function ChangeAvatar({
    currentAvatar,
    onUpdateSuccess,
}: ChangeAvatarProps) {
    const { user } = useAuth();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [options, setOptions] = useState(() => generateIdenticonOptions(8));

    const refreshOptions = () => {
        setOptions(generateIdenticonOptions(8));
    };

    const handleSelect = (url: string) => {
        setPreviewUrl(url);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !previewUrl) return;

        setLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ picture: previewUrl })
                .eq("id", user.id);

            if (updateError) throw updateError;

            onUpdateSuccess(previewUrl);
        } catch (err: unknown) {
            console.error("Error updating avatar:", err);
            setError((err as Error).message || "Failed to update avatar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSave}
            className="space-y-8">
            <div className="flex flex-col items-center justify-center gap-6 py-4">
                <div className="flex items-center gap-8">
                    {/* Current Avatar */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Current
                        </span>
                        <Avatar className="h-24 w-24 border-2 border-muted shadow-sm">
                            <AvatarImage src={currentAvatar} />
                            <AvatarFallback>
                                <UserIcon size={40} />
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="text-muted-foreground/30">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </div>

                    {/* New Preview */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">
                            New
                        </span>
                        <Avatar
                            className={`h-24 w-24 border-2 ${previewUrl ? "border-primary shadow-md" : "border-dashed border-muted"} transition-all`}>
                            {previewUrl ? (
                                <AvatarImage src={previewUrl} />
                            ) : null}
                            <AvatarFallback className="bg-muted/30">
                                <UserIcon
                                    size={40}
                                    className="text-muted-foreground/20"
                                />
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Choose an Avatar</h3>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={refreshOptions}
                        className="h-8 gap-2"></Button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {options.map((option, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleSelect(option.url)}
                            className={`relative rounded-xl border-2 p-1 transition-all hover:scale-105 active:scale-95 ${
                                previewUrl === option.url
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-transparent hover:border-muted-foreground/30"
                            }`}>
                            <Avatar className="h-full w-full">
                                <AvatarImage src={option.url} />
                                <AvatarFallback>
                                    <UserIcon size={20} />
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md">
                    {error}
                </p>
            )}

            <Button
                type="submit"
                disabled={loading || !previewUrl}
                className="w-full">
                {loading ? "Saving..." : "Save New Identicon"}
            </Button>
        </form>
    );
}
