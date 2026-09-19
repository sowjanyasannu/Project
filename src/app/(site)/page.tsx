import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { CustomUniformCTA } from "@/components/home/custom-cta";
import { TrustElements } from "@/components/home/trust-elements";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/data/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default async function HomePage() {
  const settings = await getSiteSettings();
  const whatsappHref = buildWhatsAppLink(
    "Hello Jobert Apparels, I'd like to know more about your uniforms.",
    settings.whatsapp_number
  );

  return (
    <>
      <Hero settings={settings} />
      <TrustElements />
      <CustomUniformCTA />

      <section className="container-app py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-navy sm:text-3xl">About Jobert Apparels</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {settings.company_name} manufactures premium school uniforms, corporate wear, healthcare and
              hospitality uniforms, and sportswear — built for durability, comfort and consistent fit across
              every size. From single retail orders to large institutional bulk requirements, every garment is
              made to the same standard of quality.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button render={<Link href="/shop" />}>Explore Our Products</Button>
              <Button variant="outline" className="border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white" render={<Link href="/contact" />}>
                Contact Us
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border p-6 sm:p-8">
            <p className="font-heading text-lg font-semibold text-brand-navy">Get in Touch</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-brand-navy" />
                <span className="text-muted-foreground">{settings.address ?? "Bengaluru, Karnataka"}</span>
              </div>
              {settings.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0 text-brand-navy" />
                  <a href={`tel:${settings.phone}`} className="hover:underline">{settings.phone}</a>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0 text-brand-navy" />
                  <a href={`mailto:${settings.email}`} className="hover:underline">{settings.email}</a>
                </div>
              )}
              {settings.whatsapp_number && (
                <div className="flex items-center gap-3">
                  <MessageCircle className="size-4 shrink-0 text-brand-navy" />
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Chat with us on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
