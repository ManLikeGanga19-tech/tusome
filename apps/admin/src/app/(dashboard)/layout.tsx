"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Shield,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "content_editor", "support_agent"] },
  { href: "/users", label: "Users", icon: Users, roles: ["super_admin", "support_agent"] },
  { href: "/content", label: "Content", icon: BookOpen, roles: ["super_admin", "content_editor"] },
  { href: "/admins", label: "Admins", icon: Shield, roles: ["super_admin"] },
  { href: "/audit", label: "Audit Log", icon: ClipboardList, roles: ["super_admin"] },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  content_editor: "Content Editor",
  support_agent: "Support Agent",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !admin) router.replace("/login");
  }, [admin, loading, router]);

  if (loading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  const visible = navItems.filter((n) => n.roles.includes(admin.role));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col bg-white border-r border-gray-200 shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-lg">Tusome</span>
          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visible.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {admin.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {ROLE_LABELS[admin.role]}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
