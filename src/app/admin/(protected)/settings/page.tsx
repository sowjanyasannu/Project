import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/data/site";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-brand-navy">Settings</h1>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Razorpay keys and the email provider key are set as server environment variables, not here, so they are
        never exposed to the browser. See the project README for the full list of environment variables.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
