import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/dashboard";
// add when protected routes are added
// import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <div className="min-h-screen flex items-center justify-center bg-muted">
                        <LoginPage />
                    </div>
                }
            />
            <Route
                path="/signup"
                element={
                    <div className="min-h-screen flex items-center justify-center bg-muted">
                        <SignupPage />
                    </div>
                }
            />
            <Route
                path="/auth/callback"
                element={<AuthCallback />}
            />
            <Route
                path="/dashboard"
                element={
                    <div className="min-h-screen flex items-center justify-center bg-muted">
                        <Dashboard />
                    </div>
                }
            />
        </Routes>
    );
}
