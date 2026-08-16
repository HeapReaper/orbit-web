"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface JoinData {
  date: string;
  count: number;
}

interface Props {
  data: JoinData[];
}

export default function JoinsOverTimeChart({ data }: Props) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 500, height: 288 }}
      >
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis width={110} />
          <Tooltip
            formatter={(value: number) => [`${value}`, "Members"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--primary-color)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
