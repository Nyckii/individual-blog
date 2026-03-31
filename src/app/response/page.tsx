import StepExplorer from "@/components/StepExplorer";
import { RETURN_STEPS } from "@/lib/return-steps";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Response",
  description:
    "Part 2: How the website's response travels back through the Tor network to Alice.",
};

export default function ResponsePage() {
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
                Part 2: How the website&apos;s response travels back to Alice.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <StepExplorer steps={RETURN_STEPS} />

        {/* Link back to part 1 */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            ← Back to Part 1: Sending the Request
          </Link>
        </div>
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
