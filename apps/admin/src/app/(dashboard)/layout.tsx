"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Shield,
  ClipboardList,
  LogOut,
  BarChart2,
  CreditCard,
  FileText,
  Star,
  Megaphone,
  HelpCircle,
  Monitor,
  AlertTriangle,
  Menu,
  X,
  Brain,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/dashboard",     label: "Dashboard",       icon: LayoutDashboard, roles: ["super_admin", "content_editor", "support_agent"] },
  { href: "/analytics",     label: "Analytics",       icon: BarChart2,       roles: ["super_admin"] },
  { href: "/users",         label: "Users",           icon: Users,           roles: ["super_admin", "support_agent"] },
  { href: "/payments",      label: "Payments",        icon: CreditCard,      roles: ["super_admin", "support_agent"] },
  { href: "/content",       label: "Content",         icon: BookOpen,        roles: ["super_admin", "content_editor"] },
  { href: "/quizzes",       label: "Quizzes",         icon: Brain,           roles: ["super_admin", "content_editor"] },
  { href: "/blog",          label: "Blog",            icon: FileText,        roles: ["super_admin", "content_editor", "support_agent"] },
  { href: "/stories",       label: "Success Stories", icon: Star,            roles: ["super_admin", "content_editor", "support_agent"] },
  { href: "/announcements", label: "Announcements",   icon: Megaphone,       roles: ["super_admin", "content_editor", "support_agent"] },
  { href: "/faqs",          label: "FAQs",            icon: HelpCircle,      roles: ["super_admin", "content_editor", "support_agent"] },
  { href: "/suspicious",    label: "Suspicious",      icon: AlertTriangle,   roles: ["super_admin"] },
  { href: "/sessions",      label: "Sessions",        icon: Monitor,         roles: ["super_admin"] },
  { href: "/admins",        label: "Admins",          icon: Shield,          roles: ["super_admin"] },
  { href: "/audit",         label: "Audit Log",       icon: ClipboardList,   roles: ["super_admin"] },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !admin) router.replace("/login");
  }, [admin, loading, router]);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  const visible = navItems.filter((n) => n.roles.includes(admin.role));

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <span className="font-bold text-green-700 text-lg">Tusome</span>
        <span className="ml-2 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
          Admin
        </span>
        <button
          className="ml-auto md:hidden text-gray-400 hover:text-gray-600 p-1"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={18} />
        </button>
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
                  ? "bg-green-700 text-white"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 shrink-0">
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
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-200 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col bg-white border-r border-gray-200 shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 flex items-center px-4 bg-white border-b border-gray-200 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3 font-bold text-green-700">Tusome Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
