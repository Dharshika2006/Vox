type StepCardProps = {
  number: string;
  title: string;
  description: string;
};

export default function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="group rounded-2xl border border-[#E7E2D9] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#FF6A1A]/40 hover:shadow-[0_12px_32px_rgba(22,20,15,0.06)]">
      <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-[#FF6A1A]">
        {number}
      </span>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-[#16140F]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6B6558]">
        {description}
      </p>
    </div>
  );
}
