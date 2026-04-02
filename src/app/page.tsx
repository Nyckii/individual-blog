import StepExplorer from "@/components/StepExplorer";
import { STEPS } from "@/lib/steps";
import Link from "next/link";

export default function Home() {
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
                An interactive guide to how Tor and onion routing protect your
                privacy on the internet.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <StepExplorer
          steps={STEPS}
          endCta={
            <div className="mt-12 text-center">
              <p className="text-gray-500 mb-3">
                Now it&apos;s your turn. Build a Tor circuit yourself!
              </p>
              <Link
                href="/build-circuit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
              >
                Build Your Own Circuit →
              </Link>
            </div>
          }
        />
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
