"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Props = {
    href: string
    label: string
}

export default function NavLink({ href, label }: Props) {
    const pathname = usePathname()
    const isActive = pathname === href

    return (
        <Link
            href={href}
            className={isActive ? "bg-blue-100 text-blue-600" : ""}
        >
            {label}
        </Link>
    )
}