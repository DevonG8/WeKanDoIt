import { AppSidebar } from "@/components/navbar/NavBar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Dashboard() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="relative flex min-h-screen w-full flex-col items-center justify-center">
                <div className="absolute left-4 top-4">
                    <SidebarTrigger />
                </div>

                <h1 className="text-2xl font-bold">
                    Welcome to the Dashboard!
                </h1>
            </main>
        </SidebarProvider>
    );
}