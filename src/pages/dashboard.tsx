import { AppSidebar } from "@/components/NavBar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Dashboard() {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full items-center justify-center">
                <AppSidebar />
                <h1 className="text-2xl font-bold">
                    Welcome to the Dashboard!
                </h1>
            </div>
        </SidebarProvider>
    );
}
