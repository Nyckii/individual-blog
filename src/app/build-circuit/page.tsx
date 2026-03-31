import CircuitBuilder from "@/components/CircuitBuilder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Your Circuit: Peeling the Onion",
  description:
    "Hands-on: pick relay nodes, get session keys, and wrap the onion yourself.",
};

export default function BuildCircuitPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Peeling the Onion
              </h1>
              <p className="mt-2 text-lg text-gray-500">
                Your turn: build a Tor circuit and wrap the onion yourself.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <CircuitBuilder />
      </main>

      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 text-sm text-gray-400">
          Built as an explorable explanation for Design in Educational
          Technology, ETH Zurich, FS26
        </div>
      </footer>
    </div>
  );
}
