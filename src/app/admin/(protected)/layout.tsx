import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, FileText, Settings, LogOut } from "lucide-react";
import { getCurrentAdmin, signOutAction } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/custom-requests", label: "Custom & Bulk Requests", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r bg-brand-navy text-white md:block">
        <div className="p-5">
          <p className="font-heading text-lg font-bold">Jobert Admin</p>
          <p className="mt-1 text-xs text-white/60">
            {admin.full_name} · {admin.role.replace(/_/g, " ")}
          </p>
        </div>
        <nav className="space-y-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/10">
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
        <form action={signOutAction} className="mt-6 px-3">
          <button type="submit" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10">
            <LogOut className="size-4" /> Logout
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 bg-muted/20 p-6">{children}</main>
    </div>
  );
}
