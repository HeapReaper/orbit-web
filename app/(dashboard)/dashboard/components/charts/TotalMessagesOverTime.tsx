"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HourlyData {
  hour: string;
  messages: number;
}

interface Props {
  data: HourlyData[];
}

export default function TotalMessagesOverTime({ data }: Props) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period_start"  />
          <YAxis width={110} />
          <Tooltip />
          <Line type="monotone" dataKey="message_count" stroke="var(--primary-color)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
