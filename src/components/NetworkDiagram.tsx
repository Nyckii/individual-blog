"use client";

import { motion } from "framer-motion";
import { NODES, CONNECTIONS, IP_ADDRESSES, type Step } from "@/lib/steps";

const PADDING_X = 80;
const PADDING_Y = 40;

function getNodePosition(
  nodeId: string,
  width: number,
  height: number
): { x: number; y: number } {
  const node = NODES.find((n) => n.id === nodeId)!;
  const usableWidth = width - PADDING_X * 2;
  const usableHeight = height - PADDING_Y * 2;
  return {
    x: PADDING_X + (node.x / 100) * usableWidth,
    y: PADDING_Y + (node.y / 100) * usableHeight,
  };
}

const LAYER_COLORS = [
  "#3b82f6", // blue - Exit layer (innermost)
  "#22c55e", // green - Middle layer
  "#ef4444", // red - Guard layer (outermost)
];

const NODE_COLORS: Record<string, string> = {
  alice: "#6366f1",
  guard: "#ef4444",
  middle: "#22c55e",
  exit: "#3b82f6",
  website: "#8b5cf6",
};

/** Renders an SVG icon for the given node inside the network diagram */
function NodeSvgIcon({ nodeId, x, y }: { nodeId: string; x: number; y: number }) {
  const color = NODE_COLORS[nodeId] || "#6b7280";
  const s = 10; // half-size offset

  switch (nodeId) {
    case "alice":
      return (
        <g>
          <rect x={x - s} y={y - s + 1} width={s * 2} height={s * 1.4} rx={2} stroke={color} strokeWidth="1.5" fill="none" />
          <line x1={x - s + 2} y1={y + s * 0.7} x2={x + s - 2} y2={y + s * 0.7} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );
    case "guard":
      return (
        <path
          d={`M${x},${y - s} L${x - s},${y - s + 5} L${x - s},${y + 2} Q${x},${y + s + 2} ${x},${y + s + 2} Q${x},${y + s + 2} ${x + s},${y + 2} L${x + s},${y - s + 5} Z`}
          stroke={color} strokeWidth="1.5" fill={color + "20"}
        />
      );
    case "middle":
      return (
        <g>
          <path d={`M${x - s},${y - 4} L${x - 3},${y - 4} L${x + 3},${y + 4} L${x + s},${y + 4}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d={`M${x - s},${y + 4} L${x - 3},${y + 4} L${x + 3},${y - 4} L${x + s},${y - 4}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "exit":
      return (
        <g>
          <rect x={x - s} y={y - s} width={s * 1.3} height={s * 2} rx={1} stroke={color} strokeWidth="1.5" fill="none" />
          <path d={`M${x + 2},${y} L${x + s},${y} M${x + s},${y} L${x + s - 3},${y - 3} M${x + s},${y} L${x + s - 3},${y + 3}`} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "website":
      return (
        <g>
          <circle cx={x} cy={y} r={s} stroke={color} strokeWidth="1.5" fill="none" />
          <ellipse cx={x} cy={y} rx={s * 0.45} ry={s} stroke={color} strokeWidth="1" fill="none" />
          <line x1={x - s} y1={y} x2={x + s} y2={y} stroke={color} strokeWidth="1" />
        </g>
      );
    default:
      return <circle cx={x} cy={y} r={s} stroke={color} strokeWidth="1.5" fill="none" />;
  }
}

interface Props {
  step: Step;
  width?: number;
  height?: number;
}

export default function NetworkDiagram({
  step,
  width = 800,
  height = 270,
}: Props) {
  const messagePos = step.messageAt
    ? getNodePosition(step.messageAt, width, height)
    : null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Connections */}
      {CONNECTIONS.map(([from, to]) => {
        const fromPos = getNodePosition(from, width, height);
        const toPos = getNodePosition(to, width, height);
        const isActiveForward =
          step.activeConnection?.[0] === from &&
          step.activeConnection?.[1] === to;
        const isActiveReverse =
          step.activeConnection?.[0] === to &&
          step.activeConnection?.[1] === from;
        const isActive = isActiveForward || isActiveReverse;

        // Animate packet in the direction specified by activeConnection
        const animStart = isActiveReverse ? toPos : fromPos;
        const animEnd = isActiveReverse ? fromPos : toPos;

        return (
          <g key={`${from}-${to}`}>
            <line
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke={isActive ? "#8b5cf6" : "#d1d5db"}
              strokeWidth={isActive ? 3 : 2}
              strokeDasharray={isActive ? undefined : "8 4"}
            />
            {isActive && (
              <motion.circle
                r={5}
                fill="#8b5cf6"
                initial={{ cx: animStart.x, cy: animStart.y, opacity: 0 }}
                animate={{
                  cx: [animStart.x, animEnd.x],
                  cy: [animStart.y, animEnd.y],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {NODES.map((node) => {
        const pos = getNodePosition(node.id, width, height);
        const isHighlighted =
          step.messageAt === node.id ||
          step.activeConnection?.includes(node.id);
        const hasVisibility = step.visibility[node.id] != null;

        return (
          <g key={node.id}>
            {/* Node circle */}
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={32}
              fill={isHighlighted ? "#f5f3ff" : "#f9fafb"}
              stroke={
                isHighlighted
                  ? "#8b5cf6"
                  : hasVisibility
                    ? "#a78bfa"
                    : "#d1d5db"
              }
              strokeWidth={isHighlighted ? 3 : 2}
              animate={{
                scale: isHighlighted ? 1.05 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />

            {/* Icon */}
            <NodeSvgIcon nodeId={node.id} x={pos.x} y={pos.y} />

            {/* Label */}
            <text
              x={pos.x}
              y={pos.y + 50}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill={isHighlighted ? "#5b21b6" : "#374151"}
            >
              {node.label}
            </text>

            {/* IP address */}
            <text
              x={pos.x}
              y={pos.y + 66}
              textAnchor="middle"
              fontSize={10}
              fontFamily="monospace"
              fill="#9ca3af"
            >
              {IP_ADDRESSES[node.id]}
            </text>
          </g>
        );
      })}

      {/* Onion message at current node */}
      {messagePos && step.encryptionLayers > 0 && (
        <g>
          {Array.from({ length: step.encryptionLayers }).map((_, i) => {
            const layerIndex = step.encryptionLayers - 1 - i;
            const radius = 10 + layerIndex * 6;
            return (
              <motion.circle
                key={i}
                cx={messagePos.x}
                cy={messagePos.y - 55}
                r={radius}
                fill="none"
                stroke={LAYER_COLORS[layerIndex]}
                strokeWidth={4}
                opacity={0.8}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 200,
                }}
              />
            );
          })}
          {/* Inner dot representing the actual message */}
          <motion.circle
            cx={messagePos.x}
            cy={messagePos.y - 55}
            r={4}
            fill="#1e1b4b"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          />
        </g>
      )}

      {/* Plain message indicator (no encryption) at website */}
      {messagePos && step.encryptionLayers === 0 && step.messageAt === "website" && (
        <g>
          <motion.rect
            x={messagePos.x - 16}
            y={messagePos.y - 72}
            width={32}
            height={20}
            rx={4}
            fill="#fef3c7"
            stroke="#f59e0b"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
          <motion.text
            x={messagePos.x}
            y={messagePos.y - 59}
            textAnchor="middle"
            fontSize={10}
            fill="#92400e"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            msg
          </motion.text>
        </g>
      )}
    </svg>
  );
}
