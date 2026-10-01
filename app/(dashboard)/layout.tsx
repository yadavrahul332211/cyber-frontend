"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { isLoggedIn } from "@/lib/auth";

export default function DashboardLayout({
                                          children,
                                        }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/login");
    else setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
  );
}