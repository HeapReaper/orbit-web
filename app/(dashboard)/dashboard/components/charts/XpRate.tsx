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

interface Props {
  xpRate: number;
  curveExponent: number;
}

export default function XpRateChart({ xpRate, curveExponent }: Props) {
  const data = Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;

    const xp = xpRate * (8.196 * Math.pow(level + 1, curveExponent) + 200);

    return {
      name: `Lv ${level}`,
      value: Math.round(xp),
    };
  });

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-xl h-[300px] mr-4">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
