import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        const { error: signupError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name: name },
            },
        });

        setLoading(false);

        if (signupError) {
            console.error("Signup error:", signupError);
            setError(signupError.message);
        } else {
            setSuccess(true);
        }
    };

    return (
        <>
            <div
                className={cn("flex flex-col gap-6", className)}
                {...props}>
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">
                            Create your account
                        </CardTitle>
                        <CardDescription>
                            Enter your details below to join the campaign.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="name">
                                        Full Name
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        required
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />
                                </Field>

                                <Field className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <FieldLabel htmlFor="password">
                                            Password
                                        </FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <FieldLabel htmlFor="confirm-password">
                                            Confirm
                                        </FieldLabel>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </Field>

                                {error && (
                                    <p className="text-sm text-red-500 text-center font-medium">
                                        {error}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full">
                                    {loading
                                        ? "Creating account..."
                                        : "Create Account"}
                                </Button>

                                <FieldDescription className="text-center">
                                    Already have an account?{" "}
                                    <a
                                        href="/"
                                        className="underline hover:text-gold">
                                        Sign in
                                    </a>
                                </FieldDescription>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>

                <FieldDescription className="px-6 text-center">
                    By clicking continue, you agree to our{" "}
                    <a
                        href="#"
                        className="underline">
                        Terms of Service
                    </a>
                    .
                </FieldDescription>
            </div>

            {success && (
                <div
                    className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
                    onClick={() => setSuccess(false)}>
                    <div
                        className="w-full max-w-md animate-in fade-in zoom-in duration-300"
                        onClick={(e) => e.stopPropagation()}>
                        <Alert className="bg-white border-2 shadow-2xl relative">
                            <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                            <AlertTitle className="text-lg font-bold text-black">
                                Account created!
                            </AlertTitle>
                            <AlertDescription className="mt-2 text-base text-neutral-600">
                                Please check{" "}
                                <span className="font-bold text-black">
                                    {email}
                                </span>{" "}
                                to verify your account before logging in.
                                <div className="mt-6 flex flex-col gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setSuccess(false);
                                            window.location.href = "/";
                                        }}
                                        className="w-full bg-black text-white hover:bg-neutral-800">
                                        Proceed to Login
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSuccess(false);
                                        }}
                                        className="text-sm text-neutral-500 font-medium hover:text-black transition-colors">
                                        Close
                                    </button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            )}
        </>
    );
}
