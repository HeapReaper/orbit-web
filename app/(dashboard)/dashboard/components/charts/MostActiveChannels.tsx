"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChannelData {
  channel: string;
  messages: number;
}

interface Props {
  data: ChannelData[];
}

export default function TopChannelsChart({ data }: Props) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={110} />
          <Tooltip />
          <Bar dataKey="message_count" fill="var(--primary-color)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
