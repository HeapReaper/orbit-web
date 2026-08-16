"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartData {
  date: string;
  commands: number;
}

interface Props {
  data: ChartData[];
}

export default function CommandUsageChart({ data }: Props) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 500, height: 288 }}
      >
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="commands"
            stroke="var(--primary-color)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
