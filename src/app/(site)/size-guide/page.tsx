import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SizeChart, SizeChartEntry } from "@/types/database";

export const metadata = { title: "Size Guide" };

export default async function SizeGuidePage() {
  const supabase = await createServerSupabaseClient();
  const { data: charts } = await supabase.from("size_charts").select("*");
  const { data: entries } = await supabase.from("size_chart_entries").select("*").order("display_order");

  return (
    <div className="container-app max-w-3xl py-14">
      <h1 className="font-heading text-3xl font-bold text-brand-navy">Size Guide</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Find your size below, or use the size chart on any product page.
      </p>

      <div className="mt-8 space-y-10">
        {((charts as SizeChart[]) ?? []).map((chart) => {
          const chartEntries = ((entries as SizeChartEntry[]) ?? []).filter((e) => e.size_chart_id === chart.id);
          const keys = chartEntries.length ? Object.keys(chartEntries[0].measurements) : [];
          return (
            <div key={chart.id}>
              <h2 className="font-heading text-lg font-semibold text-brand-navy">{chart.name}</h2>
              <div className="mt-3 overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      {keys.map((k) => (
                        <TableHead key={k} className="capitalize">{k.replace(/_/g, " ")}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.size_label}</TableCell>
                        {keys.map((k) => (
                          <TableCell key={k}>{entry.measurements[k]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
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
