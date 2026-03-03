import Sidebar from "@/components/dashboard/SideBar";

type Props = {
    children: React.ReactNode
}

export default function DashboardLayout({children}: Props) {
    return (
        <div className="flex min-h-screen">
            <Sidebar/>
            <div className="flex-1">
                {children}
            </div>
        </div>
    )
}