"use client";

type MicButtonProps = {
  state: "idle" | "recording" | "processing";
  onClick: () => void;
};

export default function MicButton({
  state,
  onClick,
}: MicButtonProps) {
    const label =
      state === "processing"
        ? "Processing..."
        : state === "recording"
        ? "Listening..."
        : "Start Recording";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "processing"}
      className="group inline-flex items-center gap-3 rounded-full bg-[#16140F] px-8 py-4 text-base font-medium text-[#FAF9F6] shadow-[0_1px_2px_rgba(22,20,15,0.06)] transition-all duration-200 hover:bg-[#FF6A1A] hover:shadow-[0_8px_24px_rgba(255,106,26,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>

      {label}
    </button>
  );
}