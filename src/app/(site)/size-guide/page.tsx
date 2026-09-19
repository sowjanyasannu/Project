import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SizeChart } from "@/types/database";

export const metadata = { title: "Size Guide" };

export default async function SizeGuidePage() {
  const supabase = await createServerSupabaseClient();
  const { data: charts } = await supabase.from("size_charts").select("*").order("display_order");

  return (
    <div className="container-app max-w-3xl py-14">
      <h1 className="font-heading text-3xl font-bold text-brand-navy">Size Guide</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Find your size below, or use the size chart on any product page.
      </p>

      <div className="mt-8 space-y-10">
        {((charts as SizeChart[]) ?? []).map((chart) => (
          <div key={chart.id}>
            <h2 className="font-heading text-lg font-semibold text-brand-navy">{chart.title}</h2>
            <div className="mt-3 overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {chart.columns.map((col) => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chart.rows.map((row, i) => (
                    <TableRow key={i}>
                      {chart.columns.map((col, j) => (
                        <TableCell key={col} className={j === 0 ? "font-medium" : undefined}>
                          {row[col]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {chart.note && <p className="mt-2 text-xs text-muted-foreground">{chart.note}</p>}
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border p-6">
        <h2 className="font-heading text-lg font-semibold text-brand-navy">How to Measure Yourself</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape level.</li>
          <li><strong>Waist:</strong> Measure around your natural waistline, above the hip bone.</li>
          <li><strong>Hip:</strong> Measure around the fullest part of your hips.</li>
          <li><strong>Shoulder:</strong> Measure from one shoulder point to the other, across the back.</li>
          <li><strong>Sleeve Length:</strong> Measure from the shoulder point to the wrist.</li>
          <li><strong>Inseam:</strong> Measure from the crotch to the bottom of the ankle.</li>
        </ul>
      </div>
    </div>
  );
}
