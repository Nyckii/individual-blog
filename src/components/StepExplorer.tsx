"use client";

import type { Step } from "@/lib/steps";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import MessageInput from "./MessageInput";
import NetworkDiagram from "./NetworkDiagram";
import PacketDiagram from "./PacketDiagram";
import Quiz from "./Quiz";
import VisibilityPanel from "./VisibilityPanel";

interface Props {
  steps: Step[];
  showMessageInput?: boolean;
  showQuiz?: boolean;
  /** Label for the message input */
  messageLabel?: string;
  /** Default placeholder for the message */
  messagePlaceholder?: string;
}

export default function StepExplorer({
  steps,
  showMessageInput = false,
  showQuiz = false,
  messageLabel,
  messagePlaceholder,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userMessage, setUserMessage] = useState("");
  const step = steps[currentStep];

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  }, [steps.length]);

  const goPrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const hasPacket = step.packetLayers != null;
  const hasVisibility = Object.keys(step.visibility).length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Message input */}
      {showMessageInput && (
        <MessageInput
          value={userMessage}
          onChange={setUserMessage}
          label={messageLabel}
          placeholder={messagePlaceholder}
        />
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-1.5 mb-6">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(s.id)}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              s.id === currentStep
                ? "bg-violet-600"
                : s.id < currentStep
                  ? "bg-violet-300"
                  : "bg-gray-200"
            }`}
            aria-label={`Go to step ${s.id + 1}: ${s.title}`}
          />
        ))}
      </div>

      {/* Step counter + keyboard hint */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500">
          Step {currentStep + 1} of {steps.length}
        </div>
        <div className="text-xs text-gray-400 hidden sm:block">
          Use ← → arrow keys to navigate
        </div>
      </div>

      {/* Network diagram */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-6">
        <NetworkDiagram step={step} />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {step.title}
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Key insight callout */}
          <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-4 mb-4">
            <p className="text-sm font-medium text-violet-900">
              <span className="font-bold">Remember:</span> {step.insight}
            </p>
          </div>

          {/* Side-by-side: Packet structure + Node knowledge */}
          {hasPacket && hasVisibility ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PacketDiagram step={step} userMessage={userMessage} />
              <VisibilityPanel step={step} />
            </div>
          ) : hasPacket ? (
            <PacketDiagram step={step} userMessage={userMessage} />
          ) : (
            <VisibilityPanel step={step} />
          )}

          {/* Quiz on the final step */}
          {showQuiz && step.id === steps.length - 1 && <Quiz />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <button
          onClick={goNext}
          disabled={currentStep === steps.length - 1}
          className="px-6 py-2.5 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
