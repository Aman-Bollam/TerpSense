"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Decision } from "@/types";
import { InterventionCard } from "@/components/intervention/InterventionCard";
import { useSessionStore } from "@/store/sessionStore";
import { recordDecision } from "@/lib/api";

export default function InterventionPage() {
  const router = useRouter();
  const {
    interventionResult,
    pendingPurchase,
    setDecision,
    setUpdatedGoalAmount,
    activeProfileId,
    setDashboardNeedsRefresh,
  } = useSessionStore();

  // Guard: if no result in store, send back to purchase
  useEffect(() => {
    if (!interventionResult || !pendingPurchase) {
      router.replace("/purchase");
    }
  }, [interventionResult, pendingPurchase, router]);

  if (!interventionResult || !pendingPurchase) return null;

  async function handleDecision(decision: Decision) {
    if (!pendingPurchase) return;

    setDecision(decision);

    try {
      const res = await recordDecision({
        user_id: "demo",
        purchase_amount: pendingPurchase.amount,
        category: pendingPurchase.category,
        merchant: pendingPurchase.merchant,
        decision,
        profile_id: activeProfileId,
      });

      if (res.updated_goal_amount != null) {
        setUpdatedGoalAmount(res.updated_goal_amount);
      }
      // Proceed posts a real purchase to Nessie — dashboard must reload
      if (decision === "proceed" || decision === "redirect") {
        setDashboardNeedsRefresh(true);
      }
    } catch {
      // Non-critical — outcome screen still renders from local state
    }

    router.push("/outcome");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/purchase"
          className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors"
        >
          ←
        </Link>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Purchase Analysis</h1>
          <p className="text-xs text-zinc-500">Here's what TerpSense found.</p>
        </div>
      </div>

      <InterventionCard
        result={interventionResult}
        purchaseAmount={pendingPurchase.amount}
        merchant={pendingPurchase.merchant}
        onDecision={handleDecision}
      />
    </main>
  );
}
