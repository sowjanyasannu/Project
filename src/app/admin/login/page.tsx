import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-heading text-xl font-bold text-brand-navy">Jobert Apparels Admin</p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
