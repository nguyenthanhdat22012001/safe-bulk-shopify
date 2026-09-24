interface IProps {
  percent: number;
  label: string;
  direction?: "forward" | "reverse";
}

const ProgressBar = ({ percent, label, direction = "forward" }: IProps) => {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mt-2"
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-brand-primary"
        style={{
          width: `${clamped}%`,
          marginLeft: direction === "reverse" ? "auto" : undefined,
        }}
      />
    </div>
  );
};

export default ProgressBar;
