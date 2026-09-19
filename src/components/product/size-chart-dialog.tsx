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
import type { SizeChart } from "@/types/database";

export function SizeChartDialog({ chart }: { chart: SizeChart }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="link" size="sm" className="h-auto p-0 text-brand-navy" />}>
        <Ruler className="mr-1 size-3.5" /> Size Guide
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{chart.title} — Size Chart</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
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
        {chart.note && <p className="text-xs text-muted-foreground">{chart.note}</p>}
      </DialogContent>
    </Dialog>
  );
}
