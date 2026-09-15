export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="container-app max-w-3xl py-14">
      <h1 className="font-heading text-3xl font-bold text-brand-navy">About Jobert Apparels</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/90">
        <p>
          Jobert Apparels Pvt. Ltd. is a Bengaluru-based manufacturer and supplier of uniforms, sportswear and
          customized apparel — serving schools, corporates, industrial units, hospitality and healthcare businesses,
          and sports teams.
        </p>
        <p>
          We manufacture ready-made uniform collections alongside a fully custom stitching and branding service, so
          organizations of any size can order exactly what they need — from a single custom jersey to a full
          academic-year uniform set for an entire school.
        </p>
        <p>
          This page is managed from the Admin Panel — the Jobert team can update this content, add real photography
          and share verified details about the business at any time.
        </p>
      </div>
    </div>
  );
}
