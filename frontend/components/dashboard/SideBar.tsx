"use client"
import Link from "next/link"
import NavLink from "@/components/dashboard/NavLink";

export default function Sidebar() {
    return (
        <div className="flex flex-col min-h-screen">

            <header>Atelier</header>

            {/* User Card */}
            <div className="flex flex-row">
                <div>M</div>
                <div className="flex flex-col">
                    <span>mark_draws</span>
                    <span>Character Design · 1hr/day</span>
                </div>
            </div>

            {/* Learn */}
            <div>
                <p>LEARN</p>
                <NavLink href="/dashboard" label="Dashboard" />
                <NavLink href="/lessons" label="Current Lesson" />
            </div>

            {/* Tools */}
            <div>
                <p>TOOLS</p>
                <NavLink href="/chat" label="Ask AI" />
                <NavLink href="/profile" label="Profile" />
            </div>

        </div>
    )
}