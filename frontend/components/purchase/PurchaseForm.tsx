"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { TransactionCategory } from "@/types";

const CATEGORIES: TransactionCategory[] = [
  "Clothing",
  "Food",
  "Entertainment",
  "Transport",
  "Subscriptions",
  "Health",
  "Shopping",
  "Other",
];

interface PurchaseFormProps {
  onSubmit: (amount: number, category: TransactionCategory, merchant?: string) => void;
  isLoading: boolean;
}

export function PurchaseForm({ onSubmit, isLoading }: PurchaseFormProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Clothing");
  const [merchant, setMerchant] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid amount greater than $0.");
      return;
    }
    setError("");
    onSubmit(parsed, category, merchant.trim() || undefined);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Purchase Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-4 py-3.5 text-zinc-100 text-lg font-medium placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>
        {error && <p className="text-red-400 text-sm mt-1.5">{error}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TransactionCategory)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3.5 text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all appearance-none cursor-pointer"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Merchant{" "}
          <span className="text-zinc-600 normal-case tracking-normal font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. ASOS, Chipotle, Spotify"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
        />
      </div>

      <Button type="submit" fullWidth size="lg" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing your spending...
          </span>
        ) : (
          "Check This Purchase"
        )}
      </Button>
    </form>
  );
}
