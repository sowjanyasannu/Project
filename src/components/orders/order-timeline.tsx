import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/types/database";

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "refunded") {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <XCircle className="size-5" />
        <span className="text-sm font-medium">{ORDER_STATUS_LABEL[status]}</span>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <ol className="space-y-3">
      {ORDER_STATUS_FLOW.map((step, i) => {
        const reached = i <= currentIndex;
        return (
          <li key={step} className="flex items-center gap-3">
            {reached ? (
              <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            ) : (
              <Circle className="size-5 shrink-0 text-muted-foreground" />
            )}
            <span className={reached ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
              {ORDER_STATUS_LABEL[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
