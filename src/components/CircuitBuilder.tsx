"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  BookIcon,
  KeyIcon,
  MailIcon,
  NewsIcon,
  OnionIcon,
  RelayIcon,
  WebsiteIcon,
} from "./Icons";

/* ───────── data ───────── */

const WEBSITES = [
  { id: "wiki", label: "Wikipedia", ip: "208.80.154.224", color: "#3b82f6" },
  { id: "news", label: "SecureDrop", ip: "203.0.113.42", color: "#64748b" },
  { id: "mail", label: "ProtonMail", ip: "185.70.42.20", color: "#8b5cf6" },
];

function WebsiteIconFor({ id, size = 20 }: { id: string; size?: number }) {
  switch (id) {
    case "wiki":
      return <BookIcon size={size} />;
    case "news":
      return <NewsIcon size={size} />;
    case "mail":
      return <MailIcon size={size} />;
    default:
      return <WebsiteIcon size={size} />;
  }
}

interface RelayNode {
  id: string;
  label: string;
  index: number;
  ip: string;
  x: number;
  y: number;
}

const RELAY_POOL: RelayNode[] = [
  { id: "relay-a", label: "Alpha", index: 0, ip: "85.214.47.13", x: 20, y: 15 },
  {
    id: "relay-b",
    label: "Bravo",
    index: 1,
    ip: "104.244.72.115",
    x: 35,
    y: 70,
  },
  {
    id: "relay-c",
    label: "Charlie",
    index: 2,
    ip: "198.51.100.89",
    x: 50,
    y: 20,
  },
  { id: "relay-d", label: "Delta", index: 3, ip: "45.33.32.156", x: 65, y: 75 },
  { id: "relay-e", label: "Echo", index: 4, ip: "172.67.182.31", x: 80, y: 25 },
  {
    id: "relay-f",
    label: "Foxtrot",
    index: 5,
    ip: "91.219.237.229",
    x: 35,
    y: 40,
  },
  { id: "relay-g", label: "Golf", index: 6, ip: "144.76.14.145", x: 65, y: 45 },
];

const ALICE = { id: "alice", label: "Alice", ip: "192.168.1.42", x: 0, y: 50 };

const ROLE_LABELS = ["Guard", "Middle", "Exit"] as const;
const ROLE_COLORS = ["#ef4444", "#22c55e", "#3b82f6"] as const;

function makeKey() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let k = "";
  for (let i = 0; i < 16; i++)
    k += chars[Math.floor(Math.random() * chars.length)];
  return k;
}

/* ───────── SVG helpers ───────── */

const SVG_W = 800;
const SVG_H = 320;
const PAD_X = 70;
const PAD_Y = 55;

function toSvg(xPct: number, yPct: number) {
  return {
    x: PAD_X + (xPct / 100) * (SVG_W - PAD_X * 2),
    y: PAD_Y + (yPct / 100) * (SVG_H - PAD_Y * 2),
  };
}

const RELAY_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#8b5cf6",
  "#ef4444",
  "#eab308",
  "#92400e",
];

/** Renders a simple SVG icon for a relay node (colored circle with first letter) */
function RelaySvgIcon({
  relay,
  x,
  y,
}: {
  relay: RelayNode;
  x: number;
  y: number;
}) {
  const color = RELAY_COLORS[relay.index % RELAY_COLORS.length];
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={8}
        fill={color + "30"}
        stroke={color}
        strokeWidth="1.5"
      />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={700}
        fill={color}
      >
        {relay.label[0]}
      </text>
    </g>
  );
}

/** Renders Alice's icon in SVG */
function AliceSvgIcon({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect
        x={x - 10}
        y={y - 8}
        width={20}
        height={14}
        rx={2}
        stroke="#6366f1"
        strokeWidth="1.5"
        fill="none"
      />
      <line
        x1={x - 8}
        y1={y + 9}
        x2={x + 8}
        y2={y + 9}
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Renders website icon in SVG */
function WebsiteSvgIcon({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={10}
        stroke="#8b5cf6"
        strokeWidth="1.5"
        fill="none"
      />
      <ellipse
        cx={x}
        cy={y}
        rx={4.5}
        ry={10}
        stroke="#8b5cf6"
        strokeWidth="1"
        fill="none"
      />
      <line
        x1={x - 10}
        y1={y}
        x2={x + 10}
        y2={y}
        stroke="#8b5cf6"
        strokeWidth="1"
      />
    </g>
  );
}

/* ───────── phase types ───────── */

type Phase =
  | "pick-website"
  | "pick-nodes"
  | "show-keys"
  | "build-onion"
  | "done";

interface SelectedNode {
  relay: RelayNode;
  role: (typeof ROLE_LABELS)[number];
  sessionKey: string;
}

/* ───────── component ───────── */

export default function CircuitBuilder() {
  const [phase, setPhase] = useState<Phase>("pick-website");
  const [website, setWebsite] = useState<(typeof WEBSITES)[number] | null>(
    null,
  );
  const [selected, setSelected] = useState<SelectedNode[]>([]);
  const [onionOrder, setOnionOrder] = useState<number[]>([]);
  const [wrongAttempt, setWrongAttempt] = useState(false);

  /* Website node position (rightmost) */
  const websiteNode = website ? { ...website, x: 100, y: 50 } : null;

  /* ── pick website ── */
  const pickWebsite = useCallback((w: (typeof WEBSITES)[number]) => {
    setWebsite(w);
    setPhase("pick-nodes");
  }, []);

  /* ── pick relay nodes ── */
  const pickNode = useCallback(
    (relay: RelayNode) => {
      if (selected.length >= 3) return;
      if (selected.some((s) => s.relay.id === relay.id)) return;
      const role = ROLE_LABELS[selected.length];
      const node: SelectedNode = { relay, role, sessionKey: makeKey() };
      const next = [...selected, node];
      setSelected(next);
      if (next.length === 3) {
        setTimeout(() => setPhase("show-keys"), 800);
      }
    },
    [selected],
  );

  /* ── build onion ── */
  const addOnionLayer = useCallback(
    (idx: number) => {
      if (onionOrder.includes(idx)) return;
      const expectedIdx = 2 - onionOrder.length;
      if (idx !== expectedIdx) {
        setWrongAttempt(true);
        setTimeout(() => setWrongAttempt(false), 800);
        return;
      }
      const next = [...onionOrder, idx];
      setOnionOrder(next);
      if (next.length === 3) {
        setTimeout(() => setPhase("done"), 600);
      }
    },
    [onionOrder],
  );

  /* ── reset ── */
  const reset = useCallback(() => {
    setPhase("pick-website");
    setWebsite(null);
    setSelected([]);
    setOnionOrder([]);
    setWrongAttempt(false);
  }, []);

  /* ── progress ── */
  const phases: Phase[] = [
    "pick-website",
    "pick-nodes",
    "show-keys",
    "build-onion",
    "done",
  ];
  const phaseIdx = phases.indexOf(phase);

  /* ── which relays are selected (by id) ── */
  const selectedIds = new Set(selected.map((s) => s.relay.id));

  /* ── circuit path for connections after selection ── */
  const circuitPath =
    selected.length === 3
      ? [
          ALICE,
          selected[0].relay,
          selected[1].relay,
          selected[2].relay,
          websiteNode!,
        ]
      : null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-8">
        {[
          "Choose destination",
          "Pick 3 relays",
          "Session keys",
          "Build the onion",
          "Done",
        ].map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                i < phaseIdx
                  ? "bg-violet-300"
                  : i === phaseIdx
                    ? "bg-violet-600"
                    : "bg-gray-200"
              }`}
            />
            <p className="text-[10px] text-gray-400 mt-1 text-center hidden sm:block">
              {label}
            </p>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ════════ PHASE 1: Pick website ════════ */}
        {phase === "pick-website" && (
          <motion.div
            key="pick-website"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Choose a destination
            </h2>
            <p className="text-gray-600 mb-6">
              Alice wants to visit a website privately. Which site should she
              connect to?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {WEBSITES.map((w) => (
                <button
                  key={w.id}
                  onClick={() => pickWebsite(w)}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-all"
                >
                  <span className="flex justify-center">
                    <WebsiteIconFor id={w.id} size={40} />
                  </span>
                  <span className="font-semibold text-gray-900">{w.label}</span>
                  <span className="text-xs font-mono text-gray-400">
                    {w.ip}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ════════ PHASE 2: Pick nodes via SVG diagram ════════ */}
        {phase === "pick-nodes" && (
          <motion.div
            key="pick-nodes"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Build your circuit
            </h2>
            <p className="text-gray-600 mb-2">
              Click on 3 relay nodes to create your circuit.{" "}
              {selected.length < 3 && (
                <span
                  className="font-semibold"
                  style={{ color: ROLE_COLORS[selected.length] }}
                >
                  Selecting: {ROLE_LABELS[selected.length]} node (
                  {selected.length + 1}/3)
                </span>
              )}
            </p>

            {/* Selected chips */}
            {selected.length > 0 && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {selected.map((s, i) => (
                  <span
                    key={s.relay.id}
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: ROLE_COLORS[i] + "20",
                      color: ROLE_COLORS[i],
                      border: `1px solid ${ROLE_COLORS[i]}`,
                    }}
                  >
                    {s.role}: {s.relay.label}
                  </span>
                ))}
              </div>
            )}

            {/* SVG Network */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
              <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto">
                {/* Connections after all 3 selected */}
                {circuitPath &&
                  circuitPath.slice(0, -1).map((from, i) => {
                    const to = circuitPath[i + 1];
                    const fromPos = toSvg(from.x, from.y);
                    const toPos = toSvg(to.x, to.y);
                    return (
                      <motion.line
                        key={`conn-${i}`}
                        x1={fromPos.x}
                        y1={fromPos.y}
                        x2={toPos.x}
                        y2={toPos.y}
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        strokeDasharray="8 4"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: i * 0.15, duration: 0.4 }}
                      />
                    );
                  })}

                {/* Alice node (always visible) */}
                {(() => {
                  const pos = toSvg(ALICE.x, ALICE.y);
                  return (
                    <g>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={32}
                        fill="#f9fafb"
                        stroke="#d1d5db"
                        strokeWidth={2}
                      />
                      <AliceSvgIcon x={pos.x} y={pos.y} />
                      <text
                        x={pos.x}
                        y={pos.y + 50}
                        textAnchor="middle"
                        fontSize={13}
                        fontWeight={600}
                        fill="#374151"
                      >
                        Alice
                      </text>
                      <text
                        x={pos.x}
                        y={pos.y + 66}
                        textAnchor="middle"
                        fontSize={10}
                        fontFamily="monospace"
                        fill="#9ca3af"
                      >
                        {ALICE.ip}
                      </text>
                    </g>
                  );
                })()}

                {/* Relay nodes */}
                {RELAY_POOL.map((relay) => {
                  const pos = toSvg(relay.x, relay.y);
                  const selIdx = selected.findIndex(
                    (s) => s.relay.id === relay.id,
                  );
                  const isSelected = selIdx !== -1;
                  const isUnselectedAfterDone =
                    selected.length === 3 && !isSelected;

                  return (
                    <motion.g
                      key={relay.id}
                      animate={{
                        opacity: isUnselectedAfterDone ? 0 : 1,
                        scale: isUnselectedAfterDone ? 0.5 : 1,
                      }}
                      transition={{ duration: 0.4 }}
                      style={{ originX: `${pos.x}px`, originY: `${pos.y}px` }}
                    >
                      {/* Clickable area */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={36}
                        fill="transparent"
                        className={
                          selected.length < 3 && !isSelected
                            ? "cursor-pointer"
                            : ""
                        }
                        onClick={() => {
                          if (selected.length < 3 && !isSelected)
                            pickNode(relay);
                        }}
                      />
                      {/* Visible circle */}
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r={32}
                        fill={isSelected ? "#f5f3ff" : "#f9fafb"}
                        stroke={isSelected ? ROLE_COLORS[selIdx] : "#d1d5db"}
                        strokeWidth={isSelected ? 3 : 2}
                        className={
                          selected.length < 3 && !isSelected
                            ? "cursor-pointer"
                            : ""
                        }
                        animate={{
                          scale: isSelected ? 1.05 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        onClick={() => {
                          if (selected.length < 3 && !isSelected)
                            pickNode(relay);
                        }}
                      />
                      {/* Hover ring for unselected */}
                      {selected.length < 3 && !isSelected && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={32}
                          fill="transparent"
                          stroke="transparent"
                          strokeWidth={3}
                          className="cursor-pointer hover:stroke-violet-300"
                          onClick={() => pickNode(relay)}
                        />
                      )}
                      {/* Icon */}
                      <g
                        className={
                          selected.length < 3 && !isSelected
                            ? "cursor-pointer"
                            : ""
                        }
                        onClick={() => {
                          if (selected.length < 3 && !isSelected)
                            pickNode(relay);
                        }}
                      >
                        <RelaySvgIcon relay={relay} x={pos.x} y={pos.y} />
                      </g>
                      {/* Role label (if selected) */}
                      {isSelected && (
                        <text
                          x={pos.x}
                          y={pos.y - 42}
                          textAnchor="middle"
                          fontSize={11}
                          fontWeight={700}
                          fill={ROLE_COLORS[selIdx]}
                        >
                          {ROLE_LABELS[selIdx]}
                        </text>
                      )}
                      {/* Name */}
                      <text
                        x={pos.x}
                        y={pos.y + 50}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={600}
                        fill={isSelected ? ROLE_COLORS[selIdx] : "#374151"}
                        className={
                          selected.length < 3 && !isSelected
                            ? "cursor-pointer"
                            : ""
                        }
                        onClick={() => {
                          if (selected.length < 3 && !isSelected)
                            pickNode(relay);
                        }}
                      >
                        {relay.label}
                      </text>
                      {/* IP */}
                      <text
                        x={pos.x}
                        y={pos.y + 65}
                        textAnchor="middle"
                        fontSize={10}
                        fontFamily="monospace"
                        fill="#9ca3af"
                      >
                        {relay.ip}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Website node (always visible) */}
                {websiteNode &&
                  (() => {
                    const pos = toSvg(websiteNode.x, websiteNode.y);
                    return (
                      <g>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={32}
                          fill="#f9fafb"
                          stroke="#d1d5db"
                          strokeWidth={2}
                        />
                        <WebsiteSvgIcon x={pos.x} y={pos.y} />
                        <text
                          x={pos.x}
                          y={pos.y + 50}
                          textAnchor="middle"
                          fontSize={13}
                          fontWeight={600}
                          fill="#374151"
                        >
                          {websiteNode.label}
                        </text>
                        <text
                          x={pos.x}
                          y={pos.y + 66}
                          textAnchor="middle"
                          fontSize={10}
                          fontFamily="monospace"
                          fill="#9ca3af"
                        >
                          {websiteNode.ip}
                        </text>
                      </g>
                    );
                  })()}
              </svg>
            </div>
          </motion.div>
        )}

        {/* ════════ PHASE 3: Show session keys ════════ */}
        {phase === "show-keys" && (
          <motion.div
            key="show-keys"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Session keys established
            </h2>
            <p className="text-gray-600 mb-6">
              Alice has negotiated a secret session key with each relay using
              Diffie-Hellman key exchange. Each node only knows its own key.
              Alice knows all three.
            </p>

            {/* Circuit diagram (SVG, final path only) */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-6">
              <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto">
                {/* Connections */}
                {circuitPath &&
                  circuitPath.slice(0, -1).map((from, i) => {
                    const to = circuitPath![i + 1];
                    const fromPos = toSvg(from.x, from.y);
                    const toPos = toSvg(to.x, to.y);
                    return (
                      <line
                        key={`conn-${i}`}
                        x1={fromPos.x}
                        y1={fromPos.y}
                        x2={toPos.x}
                        y2={toPos.y}
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        strokeDasharray="8 4"
                      />
                    );
                  })}

                {/* Alice */}
                {(() => {
                  const pos = toSvg(ALICE.x, ALICE.y);
                  return (
                    <g>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={32}
                        fill="#f9fafb"
                        stroke="#d1d5db"
                        strokeWidth={2}
                      />
                      <AliceSvgIcon x={pos.x} y={pos.y} />
                      <text
                        x={pos.x}
                        y={pos.y + 50}
                        textAnchor="middle"
                        fontSize={13}
                        fontWeight={600}
                        fill="#374151"
                      >
                        Alice
                      </text>
                    </g>
                  );
                })()}

                {/* Selected relays */}
                {selected.map((s, i) => {
                  const pos = toSvg(s.relay.x, s.relay.y);
                  return (
                    <g key={s.relay.id}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={32}
                        fill="#f5f3ff"
                        stroke={ROLE_COLORS[i]}
                        strokeWidth={3}
                      />
                      <RelaySvgIcon relay={s.relay} x={pos.x} y={pos.y} />
                      <text
                        x={pos.x}
                        y={pos.y - 42}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={700}
                        fill={ROLE_COLORS[i]}
                      >
                        {ROLE_LABELS[i]}
                      </text>
                      <text
                        x={pos.x}
                        y={pos.y + 50}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={600}
                        fill={ROLE_COLORS[i]}
                      >
                        {s.relay.label}
                      </text>
                    </g>
                  );
                })}

                {/* Website */}
                {websiteNode &&
                  (() => {
                    const pos = toSvg(websiteNode.x, websiteNode.y);
                    return (
                      <g>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={32}
                          fill="#f9fafb"
                          stroke="#d1d5db"
                          strokeWidth={2}
                        />
                        <WebsiteSvgIcon x={pos.x} y={pos.y} />
                        <text
                          x={pos.x}
                          y={pos.y + 50}
                          textAnchor="middle"
                          fontSize={13}
                          fontWeight={600}
                          fill="#374151"
                        >
                          {websiteNode.label}
                        </text>
                      </g>
                    );
                  })()}
              </svg>
            </div>

            {/* Keys */}
            <div className="space-y-3 mb-8">
              {selected.map((s, i) => (
                <motion.div
                  key={s.relay.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="flex items-center gap-4 p-4 rounded-xl border"
                  style={{
                    borderColor: ROLE_COLORS[i] + "60",
                    backgroundColor: ROLE_COLORS[i] + "08",
                  }}
                >
                  <RelayIcon index={s.relay.index} size={24} />
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: ROLE_COLORS[i] }}
                    >
                      {s.role}: {s.relay.label}
                    </p>
                    <p className="text-xs text-gray-500">Session key:</p>
                  </div>
                  <code
                    className="px-3 py-1.5 rounded-lg text-sm font-mono"
                    style={{
                      backgroundColor: ROLE_COLORS[i] + "15",
                      color: ROLE_COLORS[i],
                    }}
                  >
                    <KeyIcon size={12} /> {s.sessionKey}
                  </code>
                </motion.div>
              ))}
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-4 mb-6">
              <p className="text-sm font-medium text-violet-900">
                <span className="font-bold">Remember:</span> Each relay only
                knows its own session key. Alice knows all three. This is what
                lets her build the encrypted onion.
              </p>
            </div>

            <button
              onClick={() => setPhase("build-onion")}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
            >
              Now build the onion →
            </button>
          </motion.div>
        )}

        {/* ════════ PHASE 4: Build the onion ════════ */}
        {phase === "build-onion" && (
          <motion.div
            key="build-onion"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Build the onion
            </h2>
            <p className="text-gray-600 mb-6">
              Wrap the message in encryption layers. Think about the order
              carefully: which node will peel the <em>last</em> layer? That key
              should be wrapped <em>first</em> (innermost). Click the keys below
              in the correct order.
            </p>

            {/* Onion visualization */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="relative flex items-center justify-center"
                style={{ minHeight: 180 }}
              >
                {[...onionOrder].reverse().map((nodeIdx, visualIdx) => {
                  const depth = onionOrder.length - visualIdx;
                  const size = 100 + depth * 50;
                  return (
                    <motion.div
                      key={selected[nodeIdx].relay.id}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute rounded-full border-4 flex items-center justify-center"
                      style={{
                        width: size,
                        height: size,
                        borderColor: ROLE_COLORS[nodeIdx],
                        backgroundColor: ROLE_COLORS[nodeIdx] + "12",
                      }}
                    />
                  );
                })}
                <div className="relative z-10 bg-yellow-100 border-2 border-yellow-400 rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-yellow-700 font-medium">Message</p>
                  <p className="text-[10px] text-yellow-600">
                    → {website!.label}
                  </p>
                </div>
              </div>

              {onionOrder.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  {onionOrder.map((nodeIdx, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: ROLE_COLORS[nodeIdx] + "20",
                        color: ROLE_COLORS[nodeIdx],
                      }}
                    >
                      {i === 0
                        ? "Inner"
                        : i === onionOrder.length - 1
                          ? "Outer"
                          : "Middle"}
                      : {selected[nodeIdx].role}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Hint */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6">
              <p className="text-sm text-amber-800">
                <span className="font-bold">Hint:</span>{" "}
                {onionOrder.length === 0
                  ? "Which node is the last to decrypt? Its key should be the innermost layer."
                  : onionOrder.length === 1
                    ? "Good! Now which key wraps the second layer?"
                    : "One more layer to go. Which key forms the outermost shell?"}
              </p>
            </div>

            {/* Error feedback */}
            <AnimatePresence>
              {wrongAttempt && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-4"
                >
                  <p className="text-sm text-red-700">
                    Not quite! Think about the order each node decrypts. The
                    last decryptor&apos;s key is wrapped first.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Key buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selected.map((s, i) => {
                const used = onionOrder.includes(i);
                return (
                  <button
                    key={s.relay.id}
                    disabled={used}
                    onClick={() => addOnionLayer(i)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      used
                        ? "border-gray-100 bg-gray-50 opacity-30 cursor-not-allowed"
                        : "border-gray-200 hover:border-violet-400 hover:bg-violet-50 cursor-pointer"
                    }`}
                  >
                    <RelayIcon index={s.relay.index} size={24} />
                    <div className="text-left flex-1">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: ROLE_COLORS[i] }}
                      >
                        {s.role}
                      </p>
                      <code className="text-[10px] font-mono text-gray-400">
                        <KeyIcon size={12} /> {s.sessionKey}
                      </code>
                    </div>
                    {used && (
                      <span className="text-green-500 font-bold">Done</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ════════ PHASE 5: Done ════════ */}
        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="text-center"
          >
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4"
              >
                <OnionIcon size={48} />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Onion built correctly!
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                You wrapped the message with the <strong>Exit</strong> key first
                (innermost), then the <strong>Middle</strong> key, and finally
                the <strong>Guard</strong> key (outermost). As the message
                travels through each relay, they peel their layer, exactly in
                reverse order.
              </p>
            </div>

            {/* Circuit diagram (SVG) */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-8">
              <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto">
                {circuitPath &&
                  circuitPath.slice(0, -1).map((from, i) => {
                    const to = circuitPath![i + 1];
                    const fromPos = toSvg(from.x, from.y);
                    const toPos = toSvg(to.x, to.y);
                    return (
                      <g key={`conn-${i}`}>
                        <line
                          x1={fromPos.x}
                          y1={fromPos.y}
                          x2={toPos.x}
                          y2={toPos.y}
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          strokeDasharray="8 4"
                        />
                        <motion.circle
                          r={5}
                          fill="#8b5cf6"
                          initial={{ cx: fromPos.x, cy: fromPos.y, opacity: 0 }}
                          animate={{
                            cx: [fromPos.x, toPos.x],
                            cy: [fromPos.y, toPos.y],
                            opacity: [0, 1, 1, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            delay: i * 0.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </g>
                    );
                  })}
                {(() => {
                  const pos = toSvg(ALICE.x, ALICE.y);
                  return (
                    <g>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={32}
                        fill="#f9fafb"
                        stroke="#d1d5db"
                        strokeWidth={2}
                      />
                      <AliceSvgIcon x={pos.x} y={pos.y} />
                      <text
                        x={pos.x}
                        y={pos.y + 50}
                        textAnchor="middle"
                        fontSize={13}
                        fontWeight={600}
                        fill="#374151"
                      >
                        Alice
                      </text>
                    </g>
                  );
                })()}
                {selected.map((s, i) => {
                  const pos = toSvg(s.relay.x, s.relay.y);
                  return (
                    <g key={s.relay.id}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={32}
                        fill="#f5f3ff"
                        stroke={ROLE_COLORS[i]}
                        strokeWidth={3}
                      />
                      <RelaySvgIcon relay={s.relay} x={pos.x} y={pos.y} />
                      <text
                        x={pos.x}
                        y={pos.y - 42}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={700}
                        fill={ROLE_COLORS[i]}
                      >
                        {ROLE_LABELS[i]}
                      </text>
                      <text
                        x={pos.x}
                        y={pos.y + 50}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={600}
                        fill={ROLE_COLORS[i]}
                      >
                        {s.relay.label}
                      </text>
                    </g>
                  );
                })}
                {websiteNode &&
                  (() => {
                    const pos = toSvg(websiteNode.x, websiteNode.y);
                    return (
                      <g>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={32}
                          fill="#f9fafb"
                          stroke="#d1d5db"
                          strokeWidth={2}
                        />
                        <WebsiteSvgIcon x={pos.x} y={pos.y} />
                        <text
                          x={pos.x}
                          y={pos.y + 50}
                          textAnchor="middle"
                          fontSize={13}
                          fontWeight={600}
                          fill="#374151"
                        >
                          {websiteNode.label}
                        </text>
                      </g>
                    );
                  })()}
              </svg>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-4 mb-8 max-w-lg mx-auto">
              <p className="text-sm font-medium text-violet-900">
                <span className="font-bold">Remember:</span> The order matters!
                The innermost layer is for the last node, because each relay
                peels exactly one layer before forwarding.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={reset}
                className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                ← Try again
              </button>
              <Link
                href="/attacker"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                Continue to the Attacker Challenge →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
