import Waveform from "./Waveform";

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6 sm:px-8">
      <div className="flex justify-center border-t border-[#E7E2D9] pt-8">
        <Waveform bars={24} tone="muted" className="opacity-40" />
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16140F] font-[family-name:var(--font-display)] text-xs font-semibold text-[#FAF9F6]">
            V
          </span>
          <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#16140F]">
            Vox
          </span>
        </div>
        <p className="font-[family-name:var(--font-mono)] text-xs text-[#B9B2A3]">
          &copy; {new Date().getFullYear()} Vox. Speak naturally.
        </p>
      </div>
    </footer>
  );
}
