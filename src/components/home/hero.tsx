import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/types/database";

export function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative overflow-hidden bg-brand-navy">
      {settings.hero_image_url && (
        <Image
          src={settings.hero_image_url}
          alt=""
          fill
          priority
          className="object-cover opacity-30"
        />
      )}
      <div className="relative container-app py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Back to School Collection
          </p>
          <h1 className="font-heading text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            {settings.hero_title}
          </h1>
          <p className="mt-3 text-sm text-white/80 sm:text-base">{settings.hero_subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="bg-white text-brand-navy hover:bg-white/90" render={<Link href="/shop" />}>
              Shop Now
            </Button>
            <Button size="lg" className="bg-brand-red text-white hover:bg-brand-red/90" render={<Link href="/custom-uniforms" />}>
              Customize Your Uniform
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
              render={<Link href="/bulk-orders" />}
            >
              Request Bulk Quote
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
