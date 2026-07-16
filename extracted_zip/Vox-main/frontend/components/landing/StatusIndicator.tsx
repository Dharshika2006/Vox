type StatusIndicatorProps = {
  state: "idle" | "recording" | "processing";
};

export default function StatusIndicator({
  state,
}: StatusIndicatorProps) {
  const label =
    state === "recording"
      ? "Recording"
      : state === "processing"
      ? "Processing"
      : "Idle";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E2D9] bg-white/60 px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[#6B6558]">
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${
            state === "recording"
              ? "bg-red-500 animate-pulse"
              : state === "processing"
              ? "bg-yellow-500"
              : "bg-[#B9B2A3]"
          }`}
        />
      </span>

      <span>MIC · {label.toUpperCase()}</span>
    </div>
  );
}