type MetricCardProps = {
  title: string;
  value: string;
  change: string;
};

export default function MetricCard({
  title,
  value,
  change,
}: MetricCardProps) {
  return (
    <div className="rounded-xl  bg-white p-6 shadow-sm">
      <p className="text-sm text-green-500">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-bold">
        {value}
      </h3>

      <p className="mt-2 text-sm text-green-600">
        ↑ {change}
      </p>
    </div>
  );
}