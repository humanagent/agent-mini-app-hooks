import { useMemo } from "react";
import { AI_AGENTS } from "@/agent-registry/agents";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function generateMockData() {
  const days = 7;
  const dates: string[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    );
  }

  const agentData: Record<string, number[]> = {};
  const averageData: { date: string; average: number }[] = [];

  AI_AGENTS.forEach((agent) => {
    agentData[agent.name] = [];
    for (let i = 0; i < days; i++) {
      const responseTime = Math.floor(Math.random() * 2500) + 500;
      agentData[agent.name].push(responseTime);
    }
  });

  for (let i = 0; i < days; i++) {
    const dayAverages = AI_AGENTS.map((agent) => agentData[agent.name][i]);
    const average = Math.floor(
      dayAverages.reduce((sum, val) => sum + val, 0) / dayAverages.length,
    );
    averageData.push({
      date: dates[i],
      average,
    });
  }

  const responseTimeData = dates.map((date, index) => {
    const entry: Record<string, string | number> = { date };
    AI_AGENTS.forEach((agent) => {
      entry[agent.name] = agentData[agent.name][index];
    });
    return entry;
  });

  return { responseTimeData, averageData };
}

export function AnalyticsPage() {
  const { responseTimeData, averageData } = useMemo(
    () => generateMockData(),
    [],
  );

  const totalAgents = AI_AGENTS.length;
  const overallAverage = useMemo(() => {
    const allTimes = responseTimeData.flatMap((day) =>
      AI_AGENTS.map((agent) => day[agent.name] as number),
    );
    return Math.floor(
      allTimes.reduce((sum, val) => sum + val, 0) / allTimes.length,
    );
  }, [responseTimeData]);

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#6366f1",
    "#14b8a6",
    "#a855f7",
    "#22c55e",
    "#eab308",
    "#64748b",
  ];

  return (
    <div className="flex h-dvh min-w-0 flex-col bg-black">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <div className="mb-8">
            <h1 className="mb-2 font-semibold text-xl">Analytics</h1>
            <p className="text-xs text-muted-foreground">
              Agent performance metrics and response times
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Agents</p>
              <p className="text-2xl font-semibold">{totalAgents}</p>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Average Response Time
              </p>
              <p className="text-2xl font-semibold">{overallAverage}ms</p>
            </div>
          </div>

          <div className="mb-6 rounded border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="mb-4 text-sm font-semibold">
              Response Time per Agent (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#71717a"
                  style={{ fontSize: "12px" }}
                  label={{
                    value: "Response Time (ms)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: "12px", fill: "#71717a" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "6px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  iconType="line"
                  verticalAlign="top"
                  height={36}
                />
                {AI_AGENTS.slice(0, 5).map((agent, index) => (
                  <Line
                    key={agent.name}
                    type="monotone"
                    dataKey={agent.name}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="mb-4 text-sm font-semibold">
              Average Response Time Trend (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={averageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#71717a"
                  style={{ fontSize: "12px" }}
                  label={{
                    value: "Average Response Time (ms)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: "12px", fill: "#71717a" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
