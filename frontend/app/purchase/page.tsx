"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { analyzePurchase } from "@/lib/api";
import type { TransactionCategory } from "@/types";
import { PurchaseForm } from "@/components/purchase/PurchaseForm";
import { useSessionStore } from "@/store/sessionStore";

export default function PurchasePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { setPendingPurchase, setInterventionResult } = useSessionStore();

  async function handleSubmit(
    amount: number,
    category: TransactionCategory,
    merchant?: string
  ) {
    setIsLoading(true);
    setError("");

    try {
      setPendingPurchase({ amount, category, merchant });

      const result = await analyzePurchase({
        user_id: "demo",
        amount,
        category,
        merchant,
      });

      setInterventionResult(result);
      router.push("/intervention");
    } catch {
      setError("Analysis failed. Please check the backend is running and try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors"
        >
          ←
        </Link>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Check a Purchase</h1>
          <p className="text-xs text-zinc-500">
            Enter details before you buy — we'll analyze it.
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <PurchaseForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Demo shortcut */}
      {!isLoading && (
        <button
          onClick={() => handleSubmit(89, "Clothing", "ASOS")}
          className="mt-4 w-full text-xs text-zinc-600 hover:text-zinc-400 py-2 transition-colors cursor-pointer"
        >
          Demo: Try $89 ASOS purchase →
        </button>
      )}
    </main>
  );
}
