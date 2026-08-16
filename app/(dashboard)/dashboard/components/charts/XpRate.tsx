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

interface Props {
  xpRate: number;
  curveExponent: number;
}

export default function XpRateChart({ xpRate, curveExponent }: Props) {
  const data = Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;

    const xp = xpRate * (8.196 * (level + 1) ** curveExponent + 200);

    return {
      name: `Lv ${level}`,
      value: Math.round(xp),
    };
  });

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-xl h-[300px] mr-4">
        <ResponsiveContainer initialDimension={{ width: 500, height: 300 }}>
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
