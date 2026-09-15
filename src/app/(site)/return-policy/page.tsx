export const metadata = { title: "Return Policy" };

export default function ReturnPolicyPage() {
  return (
    <div className="container-app max-w-3xl py-14 text-sm leading-relaxed text-foreground/90">
      <h1 className="font-heading text-3xl font-bold text-brand-navy">Return Policy</h1>
      <div className="mt-6 space-y-4">
        <p>Ready-made products can be returned within 7 days of delivery if unused, unwashed, and in original packaging.</p>
        <p>Custom-stitched and bulk uniform orders — manufactured to specific measurements and branding — are not eligible for return unless there is a manufacturing defect.</p>
        <p>To start a return, contact us via the <a href="/contact" className="text-brand-navy underline">Contact page</a> or WhatsApp with your order number.</p>
      </div>
    </div>
  );
}
