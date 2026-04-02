"use client";

import { motion, AnimatePresence } from "framer-motion";
import { NODES, type Step } from "@/lib/steps";
import { NodeIcon } from "./Icons";

interface Props {
  step: Step;
}

export default function VisibilityPanel({ step }: Props) {
  const entries = Object.entries(step.visibility);

  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-5 gap-y-1">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 text-center font-bold text-green-600">+</span>
          Knows / can see
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 text-center font-bold text-red-600">
            &ndash;
          </span>
          Cannot see
        </span>
      </div>
      <AnimatePresence mode="popLayout">
        {entries.map(([nodeId, vis]) => {
          const node = NODES.find((n) => n.id === nodeId);
          if (!node) return null;

          return (
            <motion.div
              key={nodeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <h4 className="font-semibold text-sm mb-2 text-gray-800 flex items-center gap-2">
                <NodeIcon nodeId={node.id} size={18} /> {node.label}
              </h4>
              <div className="space-y-1.5">
                {vis.knows.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-green-700"
                  >
                    <span className="inline-block w-4 text-center font-bold">+</span>
                    {item}
                  </div>
                ))}
                {vis.cannotSee.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-red-600"
                  >
                    <span className="inline-block w-4 text-center font-bold">&ndash;</span>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
