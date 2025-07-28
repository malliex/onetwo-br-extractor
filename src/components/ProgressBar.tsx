type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
      <div
        className="h-4 bg-blue-600 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
