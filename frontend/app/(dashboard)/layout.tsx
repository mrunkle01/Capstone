import { Suspense } from "react";
import { Playfair_Display } from "next/font/google";
import Sidebar from "@/components/dashboard/SideBar";
import { DashboardProvider } from "@/lib/context/DashboardContext";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-playfair",
});

type Props = {
    children: React.ReactNode
}

export default function DashboardLayout({children}: Props) {
    return (
        <DashboardProvider>
            <div className={`flex min-h-screen ${playfair.variable}`}>
                <Suspense>
                    <Sidebar/>
                </Suspense>
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </DashboardProvider>
    )
}
