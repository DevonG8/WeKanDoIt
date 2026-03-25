import { Routes, Route } from "react-router-dom";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import AuthCallback from "@/pages/AuthCallback";
// add when protected routes are added
// import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
    return (
        <Routes>
            <Route
                path="/"
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
            <Route
                path="/auth/callback"
                element={<AuthCallback />}
            />
        </Routes>
    );
}
