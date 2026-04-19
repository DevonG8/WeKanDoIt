import * as React from "react";
import { AppSidebar } from "@/components/navbar/NavBar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Columns } from "@/components/Dashboard/Columns";

export default function Dashboard() {
    const [selectedHouseholdId, setSelectedHouseholdId] = React.useState<
        string | null
    >(null);

    return (
        <SidebarProvider>
            <AppSidebar
                selectedHouseholdId={selectedHouseholdId}
                onSelectHousehold={setSelectedHouseholdId}
            />
            <main className="relative flex min-h-screen w-full flex-col p-4 md:p-8">
                <div className="absolute left-4 top-4">
                    <SidebarTrigger />
                </div>

                <div className="w-full">
                    <div className="mt-4 w-full rounded-lg border p-2 shadow">
                        <Columns householdId={selectedHouseholdId} />
                    </div>
                </div>
            </main>
        </SidebarProvider>
    );
}
