import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/dashboard";
import AccountSettings from "@/pages/AccountSettings";

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
                    element={<LoginPage />}
                />
                <Route
                    path="/signup"
                    element={<SignupPage />}
                />
                <Route
                    path="/auth/callback"
                    element={<AuthCallback />}
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/account/settings"
                    element={
                        <ProtectedRoute>
                            <AccountSettings />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </ThemeProvider>
    );
}
