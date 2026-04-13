import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/dashboard";
// add when protected routes are added
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
    return (
        <ThemeProvider
            defaultTheme="dark"
            storageKey="vite-ui-theme">
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
                        <ProtectedRoute>
                            <div className="min-h-screen flex items-center justify-center bg-muted">
                                <Dashboard />
                            </div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </ThemeProvider>
    );
}
