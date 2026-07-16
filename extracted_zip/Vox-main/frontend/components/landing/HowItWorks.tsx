import StepCard from "./StepCard";

const steps = [
  {
    number: "01",
    title: "Speak",
    description:
      "Say what you need in plain language. No commands to memorize, no menus to navigate.",
  },
  {
    number: "02",
    title: "Understand",
    description:
      "Vox parses your intent and identifies the action, the recipient, and the relevant details.",
  },
  {
    number: "03",
    title: "Review",
    description:
      "See exactly what Vox is about to do, laid out clearly, before anything happens.",
  },
  {
    number: "04",
    title: "Execute",
    description:
      "Confirm once, and Vox carries out the action on your behalf — no typing required.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8">
      <div className="mx-auto max-w-xl text-center">
        <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[#FF6A1A]">
          How it works
        </span>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[#16140F] sm:text-4xl">
          From spoken words to a finished action
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <StepCard key={step.number} {...step} />
        ))}
      </div>
    </section>
  );
}
