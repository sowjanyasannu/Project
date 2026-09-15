import { ContactForm } from "@/components/contact/contact-form";
import { getSiteSettings } from "@/lib/data/site";

export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container-app py-14">
      <h1 className="font-heading text-3xl font-bold text-brand-navy">Contact Us</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="font-semibold">{settings.company_name}</p>
            <p className="text-sm text-muted-foreground">{settings.address ?? "Bengaluru, Karnataka"}</p>
          </div>
          {settings.phone && <p className="text-sm">Phone: {settings.phone}</p>}
          {settings.whatsapp_number && <p className="text-sm">WhatsApp: {settings.whatsapp_number}</p>}
          {settings.email && <p className="text-sm">Email: {settings.email}</p>}
          <p className="text-sm text-muted-foreground">Business Hours: Mon–Sat, 10:00 AM – 7:00 PM</p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
