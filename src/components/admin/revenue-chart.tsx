'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function RevenueChart() {
  const [data, setData] = useState<{ date: string; revenue: number }[]>([]);

  useEffect(() => {
    fetch('/api/admin/stats/revenue')
      .then((r) => r.json())
      .then((json) => setData(json.data ?? []))
      .catch(() => setData([]));
  }, []);

  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-ink-900/40">Loading…</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b8862e" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#b8862e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6dabd" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          tick={{ fontSize: 11, fill: '#6b6455' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: '#6b6455' }} axisLine={false} tickLine={false} width={60} />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
          labelFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        />
        <Area type="monotone" dataKey="revenue" stroke="#b8862e" strokeWidth={2} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
