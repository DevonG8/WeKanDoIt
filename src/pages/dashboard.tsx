// imports
import { AppSidebar } from "@/components/NavBar";

export default function Dashboard() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <AppSidebar />
            <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
        </div>
    );
}
