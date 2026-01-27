type WeeklyChartProps = {
  title: string;
  unit: string;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 🔧 ЗАГЛУШКА (потом заменишь на backend)
const MOCK_VALUES = [12, 14, 13, 15, 16, 14, 13];

export default function WeeklyChart({ title, unit }: WeeklyChartProps) {
  const max = Math.max(...MOCK_VALUES);

  return (
    <div className="weekly-chart">
      <h3>{title}</h3>

      <div className="chart-bars">
        {MOCK_VALUES.map((value, i) => (
          <div key={i} className="chart-bar-wrapper">
            <div
              className="chart-bar"
              style={{ height: `${(value / max) * 100}%` }}
            />
            <span className="chart-day">{DAYS[i]}</span>
            <span className="chart-value">
              {value} {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
