export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="container-app max-w-3xl py-14 text-sm leading-relaxed text-foreground/90">
      <h1 className="font-heading text-3xl font-bold text-brand-navy">Terms &amp; Conditions</h1>
      <p className="mt-2 text-xs text-muted-foreground">Draft placeholder — replace with Jobert Apparels&apos; reviewed terms before launch.</p>
      <div className="mt-6 space-y-6">
        <section>
          <h2 className="font-heading text-lg font-semibold text-brand-navy">Orders</h2>
          <p className="mt-2">All orders are subject to product availability and confirmation of payment. Prices shown are inclusive of applicable GST unless stated otherwise.</p>
        </section>
        <section>
          <h2 className="font-heading text-lg font-semibold text-brand-navy">Custom & Bulk Orders</h2>
          <p className="mt-2">Custom and bulk orders are manufactured to the specifications submitted by the customer and confirmed in the quotation. Production begins only after the quotation is approved.</p>
        </section>
        <section>
          <h2 className="font-heading text-lg font-semibold text-brand-navy">Payments</h2>
          <p className="mt-2">Payments are processed securely through our payment gateway partner. We do not store your card details.</p>
        </section>
      </div>
    </div>
  );
}
