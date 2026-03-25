import { Routes, Route } from "react-router-dom";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";

export default function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<div>Dashboard (coming soon)</div>}
            />
            <Route
                path="/login"
                element={
                    <div className="min-h-screen flex items-center justify-center bg-muted">
                        <LoginForm />
                    </div>
                }
            />
            <Route
                path="/signup"
                element={
                    <div className="min-h-screen flex items-center justify-center bg-muted">
                        <SignupForm />
                    </div>
                }
            />
        </Routes>
    );
}
