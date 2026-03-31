"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Step, PacketLayer } from "@/lib/steps";
import { LockIcon, DocIcon } from "./Icons";

interface Props {
  step: Step;
  userMessage: string;
}

export default function PacketDiagram({ step, userMessage }: Props) {
  if (!step.packetLayers) return null;

  const msg = userMessage || "Hello, website!";
  const layers: PacketLayer[] = step.packetLayers.map((layer) => ({
    ...layer,
    label: layer.label.replace("{{MESSAGE}}", msg),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl p-5"
    >
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Packet Structure
      </h3>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-0"
        >
          {layers.map((layer, i) => {
            const isOutermost = i === 0;

            return (
              <motion.div
                key={`${step.id}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
                style={{
                  marginLeft: i * 20,
                  marginTop: i === 0 ? 0 : -1,
                }}
              >
                <div
                  className="rounded-lg border-2 px-4 py-2.5"
                  style={{
                    borderColor: layer.color,
                    backgroundColor: `${layer.color}15`,
                  }}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      {layer.encrypted ? (
                        <span className="text-gray-400"><LockIcon size={14} /></span>
                      ) : (
                        <span className="text-yellow-500"><DocIcon size={14} /></span>
                      )}
                      <span
                        className="text-sm font-mono"
                        style={{ color: layer.color }}
                      >
                        {layer.label}
                      </span>
                    </div>

                    {(layer.from || layer.to) && (
                      <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
                        {layer.from && (
                          <span>
                            <span className="text-gray-500">From:</span>{" "}
                            <span className="text-gray-300">{layer.from}</span>
                          </span>
                        )}
                        {layer.to && (
                          <span>
                            <span className="text-gray-500">To:</span>{" "}
                            <span className="text-gray-300">{layer.to}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {layer.encrypted && isOutermost && layers.length > 1 && (
                    <div className="mt-1.5 text-xs text-gray-500 font-mono">
                      ┗ contains encrypted payload ↓
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {layers[0].from && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-px bg-gray-600" />
              <span>
                Network sees only:{" "}
                <span className="font-mono text-gray-300">
                  {layers[0].from}
                </span>{" "}
                →{" "}
                <span className="font-mono text-gray-300">
                  {layers[0].to}
                </span>
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
