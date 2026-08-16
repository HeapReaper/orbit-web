"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface VoiceUserData {
  name: string;
  minutes: number;
}

interface Props {
  data: VoiceUserData[];
}

export default function TopVoiceUsersChart({ data }: Props) {
  return (
    <div className="w-full h-72 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={110} />
          <Tooltip
            formatter={(value: number) => [`${value} min`, "Voice time"]}
          />
          <Bar dataKey="minutes" fill="var(--primary-color)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
