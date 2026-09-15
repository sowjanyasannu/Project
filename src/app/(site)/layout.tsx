import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { getSiteSettings, getTopCategories } from "@/lib/data/site";
import { getCartCount } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories, cartCount, user] = await Promise.all([
    getSiteSettings(),
    getTopCategories(),
    getCartCount(),
    getCurrentUser(),
  ]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.company_name,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: settings.logo_url ?? undefined,
    address: settings.address
      ? { "@type": "PostalAddress", addressLocality: settings.address, addressCountry: "IN" }
      : undefined,
    telephone: settings.phone ?? undefined,
    email: settings.email ?? undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <Header categories={categories} cartCount={cartCount} isSignedIn={Boolean(user)} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer settings={settings} />
      <MobileNav />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </>
  );
}
