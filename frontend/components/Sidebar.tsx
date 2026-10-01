"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

const links = [
    { href: "/", label: "Dashboard" },
    { href: "/assets", label: "Assets" },
    { href: "/findings", label: "Findings" },
  { href: "/scan", label: "Upload scan" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    function handleLogout() {
        logout();
        router.push("/login");
    }

    return (
        <aside className="flex w-56 flex-col border-r bg-white p-4">
            <div className="mb-6 text-lg font-semibold">CYBER</div>
            <nav className="flex flex-1 flex-col gap-1">
                {links.map((l) => {
                    const active =
                        l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                    return (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`rounded px-3 py-2 text-sm ${
                                active ? "bg-gray-100 font-medium" : "text-gray-600"
                            }`}
                        >
                            {l.label}
                        </Link>
                    );
                })}
            </nav>
            <button
                onClick={handleLogout}
                className="rounded px-3 py-2 text-left text-sm text-gray-600"
            >
                Logout
            </button>
        </aside>
    );
}