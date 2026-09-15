"use client";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface MatrixRow {
  size: string;
  [group: string]: string | number;
}

export function QuantityMatrix({
  sizes,
  columns,
  rows,
  onChange,
}: {
  sizes: string[];
  columns: string[];
  rows: MatrixRow[];
  onChange: (rows: MatrixRow[]) => void;
}) {
  function getValue(size: string, column: string): number {
    const row = rows.find((r) => r.size === size);
    return row ? Number(row[column] ?? 0) : 0;
  }

  function setValue(size: string, column: string, value: number) {
    const existingIndex = rows.findIndex((r) => r.size === size);
    const next = [...rows];
    if (existingIndex >= 0) {
      next[existingIndex] = { ...next[existingIndex], [column]: value };
    } else {
      const row: MatrixRow = { size };
      columns.forEach((c) => (row[c] = c === column ? value : 0));
      next.push(row);
    }
    onChange(next);
  }

  const total = sizes.reduce(
    (sum, size) => sum + columns.reduce((s, c) => s + getValue(size, c), 0),
    0
  );

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Size</TableHead>
              {columns.map((c) => (
                <TableHead key={c}>{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sizes.map((size) => (
              <TableRow key={size}>
                <TableCell className="font-medium">{size}</TableCell>
                {columns.map((c) => (
                  <TableCell key={c}>
                    <Input
                      type="number"
                      min={0}
                      className="w-20"
                      value={getValue(size, c) || ""}
                      onChange={(e) => setValue(size, c, Math.max(0, Number(e.target.value) || 0))}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-sm font-semibold text-brand-navy">Total Quantity: {total}</p>
    </div>
  );
}
