"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-variant border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-container/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[120px]"></div>
      </div>
      
      <Sidebar />
      <main className="flex-1 flex flex-col md:flex-row md:ml-64 h-full relative z-10 p-4 md:p-10 gap-6 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
