import styles from "./Waveform.module.css";

type WaveformProps = {
  bars?: number;
  className?: string;
  tone?: "signal" | "muted";
  active?: boolean;
};

/**
 * The page's signature element: a cluster of animated bars that reads as a
 * live audio waveform. Reused around the mic button and as a footer motif.
 */
export default function Waveform({
  bars = 14,
  className = "",
  tone = "signal",
  active = false,
}: WaveformProps) {
  const barList = Array.from({ length: bars });

  return (
    <div
      className={`${styles.waveform} ${active ? styles.active : ""} ${className}`}
      aria-hidden="true"
    >
      {barList.map((_, i) => (
        <span
          key={i}
          className={`${styles.bar} ${
            tone === "signal" ? styles.barSignal : styles.barMuted
          }`}
          style={{
            animationDelay: `${(i % 7) * 0.12}s`,
            animationPlayState: active ? "running" : "paused",
          }}
        />
      ))}
    </div>
  );
}
