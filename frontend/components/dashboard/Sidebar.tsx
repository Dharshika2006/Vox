"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ui/ThemeProvider";
import { getInitials } from "@/utils/format";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();

  const navItems = [
    { name: "Compose", href: "/dashboard", icon: "mic" },
    { name: "History", href: "/dashboard/history", icon: "history" },
    { name: "Contacts", href: "/dashboard/contacts", icon: "contacts" },
    { name: "Settings", href: "/dashboard/settings", icon: "settings" },
  ];

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme(isDark ? "light" : "dark");
  };

  return (
    <nav className="bg-surface/10 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-charcoal/5 h-screen w-64 fixed left-0 top-0 flex flex-col p-6 space-y-8 z-40 hidden md:flex">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary font-display-lg text-xl shadow-sm">
          V
        </div>
        <div>
          <h1 className="font-display-lg text-headline-sm text-primary tracking-tight">Vox AI</h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant opacity-70">Illuminated Intelligence</p>
        </div>
      </div>

      {/* Primary CTA */}
      <Link href="/dashboard" className="w-full h-12 bg-primary text-on-primary rounded-xl font-headline-sm text-[16px] shadow-lg shadow-primary/20 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
        <span>New Message</span>
      </Link>

      {/* Navigation Links */}
      <div className="flex-1 space-y-2 mt-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (isActive) {
            return (
              <Link key={item.name} href={item.href} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-primary font-semibold bg-primary/5 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                <span className="font-body-md text-body-md">{item.name}</span>
              </Link>
            );
          } else {
            return (
              <Link key={item.name} href={item.href} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
                <span className="font-body-md text-body-md">{item.name}</span>
              </Link>
            );
          }
        })}
      </div>

      {/* Theme Toggle & User Profile */}
      <div className="mt-auto flex flex-col space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">{isDark ? "light_mode" : "dark_mode"}</span>
          <span className="font-body-md text-body-md">{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <div className="group relative">
          <div className="flex items-center space-x-3 px-2 py-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center font-bold">
                {getInitials(user?.name || "User")}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-body-md text-body-md font-medium text-on-surface truncate">{user?.name || "User"}</p>
              <p className="font-label-caps text-[10px] text-on-surface-variant truncate">Premium Account</p>
            </div>
          </div>
          
          <div className="absolute bottom-full left-0 mb-2 hidden w-full rounded-xl bg-surface p-1 shadow-lg ring-1 ring-border group-hover:block z-50">
            <button
              onClick={logout}
              className="flex w-full items-center rounded-lg px-4 py-3 text-sm text-error hover:bg-error-container/20 transition-colors"
            >
              <span className="material-symbols-outlined mr-3">logout</span>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
