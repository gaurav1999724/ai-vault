"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function AnalyticsCharts({ days }: { days: { day: string; views: number; copies: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={days}>
          <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} />
          <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#171A23", border: "1px solid rgba(255,255,255,.12)" }} />
          <Area type="monotone" dataKey="views" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.25} />
          <Area type="monotone" dataKey="copies" stroke="#5DE4FF" fill="#5DE4FF" fillOpacity={0.18} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
