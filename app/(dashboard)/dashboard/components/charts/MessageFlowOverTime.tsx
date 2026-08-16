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

interface HourlyData {
  hour: string;
  messages: number;
}

interface Props {
  data: HourlyData[];
}

export default function MessageFlowChart({ data }: Props) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 500, height: 288 }}
      >
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis width={110} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="messages"
            stroke="var(--primary-color)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
