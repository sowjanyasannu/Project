import type { SiteSettings } from "@/types/database";

export function BottomTicker({ settings }: { settings: SiteSettings }) {
  const items = [
    settings.company_name,
    "Premium Uniforms & Sportswear",
    settings.phone ? `Call us: ${settings.phone}` : null,
    settings.email,
    settings.address,
    "Bulk & Custom Orders Welcome",
  ].filter(Boolean) as string[];

  const text = items.join("   •   ");

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 h-9 overflow-hidden border-t border-white/10 bg-brand-navy text-white"
      aria-label="Announcements"
    >
      <div className="flex h-full items-center whitespace-nowrap">
        <div className="animate-ticker flex shrink-0 items-center text-xs font-medium">
          <span className="px-8">{text}</span>
          <span className="px-8" aria-hidden="true">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
