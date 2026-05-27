import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Props {
  data: { date: string; revenue: number; target: number }[];
}

export function RevenueChart({ data }: Props) {
  const target = data[0]?.target ?? 333;
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Daily Revenue</h3>
          <p className="text-xs text-muted-foreground">Last 30 days · target ${target}/day</p>
        </div>
        <div className="flex gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Revenue
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-3 h-px bg-amber-400" /> Target
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" />
            <XAxis dataKey="date" stroke="hsl(0 0% 100% / 0.4)" fontSize={10} tickLine={false} />
            <YAxis stroke="hsl(0 0% 100% / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(15 23 42)",
                border: "1px solid rgb(51 65 85)",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "rgb(148 163 184)" }}
            />
            <ReferenceLine y={target} stroke="rgb(251 191 36)" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="rgb(52 211 153)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
