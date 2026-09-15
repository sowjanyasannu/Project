import Link from "next/link";
import type { SiteSettings } from "@/types/database";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-16 border-t bg-brand-navy text-white/90">
      <div className="container-app grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="font-heading text-lg font-bold text-white">Jobert Apparels</p>
          <p className="mt-2 text-sm text-white/70">
            {settings.company_name} — premium uniforms and sportswear manufactured in{" "}
            {settings.address ?? "Bengaluru, Karnataka"}.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link href="/shop/school-uniforms" className="hover:text-white">School Uniforms</Link></li>
            <li><Link href="/shop/corporate-uniforms" className="hover:text-white">Corporate Uniforms</Link></li>
            <li><Link href="/shop/healthcare" className="hover:text-white">Healthcare</Link></li>
            <li><Link href="/shop/hospitality" className="hover:text-white">Hospitality</Link></li>
            <li><Link href="/shop/sportswear" className="hover:text-white">Sportswear</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Customer Service</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link href="/track-order" className="hover:text-white">Track Order</Link></li>
            <li><Link href="/size-guide" className="hover:text-white">Size Guide</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-white">Shipping</Link></li>
            <li><Link href="/return-policy" className="hover:text-white">Returns</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Custom Orders</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link href="/custom-uniforms" className="hover:text-white">Custom Uniform</Link></li>
            <li><Link href="/bulk-orders" className="hover:text-white">Bulk Orders</Link></li>
            <li><Link href="/custom-uniforms?step=upload" className="hover:text-white">Upload Design</Link></li>
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Get in touch</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {settings.phone && <li>{settings.phone}</li>}
            {settings.whatsapp_number && <li>WhatsApp: {settings.whatsapp_number}</li>}
            {settings.email && <li>{settings.email}</li>}
            {!settings.phone && !settings.email && (
              <li className="italic text-white/50">Contact details coming soon</li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-app flex flex-col gap-2 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Jobert Apparels Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/shipping-policy" className="hover:text-white">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
