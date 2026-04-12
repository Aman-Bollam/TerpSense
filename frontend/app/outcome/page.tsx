"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OutcomeCard } from "@/components/outcome/OutcomeCard";
import { useSessionStore } from "@/store/sessionStore";

export default function OutcomePage() {
  const router = useRouter();
  const {
    decision,
    interventionResult,
    pendingPurchase,
    activeGoal,
    updatedGoalAmount,
    resetSession,
  } = useSessionStore();

  // Guard: if no decision, send back
  useEffect(() => {
    if (!decision || !interventionResult || !pendingPurchase) {
      router.replace("/dashboard");
    }
  }, [decision, interventionResult, pendingPurchase, router]);

  if (!decision || !interventionResult || !pendingPurchase) return null;

  const CONFIRMATION_MESSAGES: Record<string, string> = {
    redirect: "Smart move. Your savings goal just got closer.",
    delay: "Got it. Come back in 7 days if you still want it.",
    proceed: "Noted. No judgment — just keeping you informed.",
    alternative: "Good thinking. A cheaper option could save you real money.",
  };

  function handleBackToDashboard() {
    resetSession();
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
          ✓
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Decision Made</h1>
          <p className="text-xs text-zinc-500">Here's what happens next.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <OutcomeCard
          decision={decision}
          result={interventionResult}
          purchaseAmount={pendingPurchase.amount}
          activeGoal={activeGoal}
          updatedGoalAmount={updatedGoalAmount}
          confirmationMessage={CONFIRMATION_MESSAGES[decision]}
        />
      </div>

      <button
        onClick={handleBackToDashboard}
        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-4 rounded-xl transition-all duration-150 cursor-pointer"
      >
        Back to Dashboard
      </button>
    </main>
  );
}
