import Link from "next/link";

const proofPoints = [
  {
    icon: "⚡",
    title: "Real-time intervention",
    body: "Catches bad decisions before they happen — not after.",
  },
  {
    icon: "🧠",
    title: "Behavior-aware AI",
    body: "Analyzes your actual spending patterns, not generic averages.",
  },
  {
    icon: "🎯",
    title: "Goal-linked insights",
    body: "Every purchase is measured against what you're saving for.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 py-20">
      {/* Badge */}
      <div className="mb-8 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-sm text-emerald-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        AI Financial Intervention Agent
      </div>

      {/* Headline */}
      <h1 className="text-5xl sm:text-6xl font-bold text-center text-zinc-50 leading-tight max-w-2xl tracking-tight">
        What if your bank account could{" "}
        <span className="text-emerald-400">stop you</span> before you made a bad decision?
      </h1>

      <p className="mt-6 text-lg text-zinc-400 text-center max-w-lg leading-relaxed">
        TerpSense doesn't track your money.{" "}
        <span className="text-zinc-200 font-medium">It changes your behavior.</span> Real-time AI
        analysis before every purchase — not a report after the damage is done.
      </p>

      {/* CTA */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 rounded-xl text-base shadow-lg shadow-emerald-500/25 transition-all duration-150"
        >
          Try TerpSense
          <span className="text-lg">→</span>
        </Link>
      </div>

      {/* Proof points */}
      <div className="mt-20 grid sm:grid-cols-3 gap-5 max-w-2xl w-full">
        {proofPoints.map((p) => (
          <div
            key={p.title}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
          >
            <div className="text-2xl mb-3">{p.icon}</div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">{p.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-16 text-xs text-zinc-600 text-center">
        Demo uses Capital One Nessie mock data · Powered by Azure OpenAI
      </p>
    </main>
  );
}
