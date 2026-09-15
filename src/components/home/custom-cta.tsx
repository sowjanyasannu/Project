import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UploadCloud, Palette } from "lucide-react";

export function CustomUniformCTA() {
  return (
    <section className="container-app py-14">
      <div className="grid gap-8 overflow-hidden rounded-2xl border bg-gradient-to-br from-brand-navy to-brand-navy-dark p-8 text-white sm:p-12 md:grid-cols-2 md:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Palette className="size-3.5" /> Custom Requirement Engine
          </span>
          <h2 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">Need a Custom Uniform?</h2>
          <p className="mt-3 max-w-md text-sm text-white/80">
            Have a design, logo or reference image? Upload your requirement and let our team create it for
            you — from school sets to team jerseys and corporate branding.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="bg-brand-red hover:bg-brand-red/90" render={<Link href="/custom-uniforms" />}>
              Customize Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
              render={<Link href="/custom-uniforms?step=upload" />}
            >
              <UploadCloud className="mr-1 size-4" /> Upload Design
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            "Logo embroidery & printing",
            "Dynamic measurement forms",
            "Bulk size/quantity matrix",
            "Track your request status",
          ].map((item) => (
            <div key={item} className="rounded-lg bg-white/10 p-4">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
