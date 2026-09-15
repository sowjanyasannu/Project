import { ShieldCheck, Ruler, Factory, Boxes } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Premium Quality", desc: "Durable fabrics built for daily wear and repeated washing." },
  { icon: Factory, title: "Custom Manufacturing", desc: "In-house production for schools, companies and teams." },
  { icon: Boxes, title: "Bulk Orders", desc: "Organized quantity matrices for large institutional orders." },
  { icon: Ruler, title: "Custom Measurements", desc: "Dynamic measurement forms tailored to each garment." },
];

export function TrustElements() {
  return (
    <section className="border-y bg-muted/40">
      <div className="container-app grid grid-cols-2 gap-6 py-12 sm:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-start gap-2">
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand-navy text-white">
              <Icon className="size-5" />
            </span>
            <p className="text-sm font-semibold text-brand-navy">{title}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
