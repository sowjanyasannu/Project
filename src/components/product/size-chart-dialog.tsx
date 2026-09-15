"use client";

import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SizeChart, SizeChartEntry } from "@/types/database";

export function SizeChartDialog({ chart, entries }: { chart: SizeChart; entries: SizeChartEntry[] }) {
  const measurementKeys = entries.length ? Object.keys(entries[0].measurements) : [];

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="link" size="sm" className="h-auto p-0 text-brand-navy" />}>
        <Ruler className="mr-1 size-3.5" /> Size Guide
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{chart.name} — Size Chart</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                {measurementKeys.map((k) => (
                  <TableHead key={k} className="capitalize">
                    {k.replace(/_/g, " ")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.size_label}</TableCell>
                  {measurementKeys.map((k) => (
                    <TableCell key={k}>{entry.measurements[k]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">
          All measurements are in inches unless stated otherwise. Need help? See our{" "}
          <a href="/size-guide" className="underline">
            How to Measure
          </a>{" "}
          guide.
        </p>
      </DialogContent>
    </Dialog>
  );
}
