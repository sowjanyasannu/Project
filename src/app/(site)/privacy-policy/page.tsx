export const metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="container-app max-w-3xl py-14 text-sm leading-relaxed text-foreground/90">
      <h1 className="font-heading text-3xl font-bold text-brand-navy">Privacy Policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Draft placeholder — Jobert Apparels should have this reviewed by legal counsel before launch, particularly
        given the measurement and school-related data collected through the Custom Uniform flow.
      </p>

      <div className="mt-6 space-y-6">
        <section>
          <h2 className="font-heading text-lg font-semibold text-brand-navy">What we collect</h2>
          <p className="mt-2">
            When you shop, request a custom uniform, or request a bulk quote, we collect the information you provide
            directly: your name, contact details, delivery address, and — for custom orders — measurements, school
            or organization name, and any logos, photos or design files you upload.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-lg font-semibold text-brand-navy">Why we collect it</h2>
          <p className="mt-2">
            We use this information to process orders, prepare quotations, manufacture custom uniforms to the
            correct measurements, deliver your order, and communicate with you by email or WhatsApp about your
            order status.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-lg font-semibold text-brand-navy">Children&apos;s measurement data</h2>
          <p className="mt-2">
            School uniform requests may include a child&apos;s measurements submitted by a parent, school or
            authorized staff member. This data is used only for manufacturing the ordered uniform and is retained
            only as long as needed to fulfil and support that order.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-lg font-semibold text-brand-navy">Payments</h2>
          <p className="mt-2">
            Online payments are processed by our payment gateway partner (Razorpay). Card and payment details are
            handled directly by the gateway and are never stored on Jobert Apparels&apos; own servers.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-lg font-semibold text-brand-navy">Your rights</h2>
          <p className="mt-2">
            You can request access to, correction of, or deletion of your personal data by contacting us — see the{" "}
            <a href="/contact" className="text-brand-navy underline">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
