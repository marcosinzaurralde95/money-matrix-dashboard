import { useState } from "react";
import { Check, X, ShieldAlert, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PendingApproval } from "@/lib/mams-db";
import { formatRelative } from "@/lib/mams-mock";

interface Props {
  items: PendingApproval[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export function PendingApprovals({ items, onApprove, onReject }: Props) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessingId(id);
    try {
      if (action === "approve") {
        await onApprove(id);
      } else {
        await onReject(id);
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <ShieldAlert className="size-4 text-amber-500" />
            Cola de Aprobación Humana (Human-in-the-Loop)
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-mono text-xs"
          >
            {items.length} pendientes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            <p className="font-medium">No hay acciones requiriendo aprobación humana</p>
            <p className="text-[11px] mt-1 text-muted-foreground/80">
              Las acciones autónomas dentro del límite configurado son procesadas automáticamente.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                    {item.agentName}
                  </Badge>
                  <span className="text-xs font-bold text-emerald-500 flex items-center">
                    <DollarSign className="size-3 inline" />
                    {item.amount.toLocaleString("es-ES")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelative(item.requestedAt)}
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground">{item.action}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                  disabled={processingId === item.id}
                  onClick={() => handleAction(item.id, "approve")}
                >
                  <Check className="size-3.5 mr-1" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={processingId === item.id}
                  onClick={() => handleAction(item.id, "reject")}
                >
                  <X className="size-3.5 mr-1" />
                  Rechazar
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
