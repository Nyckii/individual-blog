"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useState } from "react";
import { DetectiveIcon, EyeIcon, LockIcon, NodeIcon } from "./Icons";

/* ───────── data ───────── */

const ALICE_IP = "192.168.1.42";
const GUARD_IP = "85.214.47.13";
const MIDDLE_IP = "104.244.72.115";
const EXIT_IP = "198.51.100.89";
const WEBSITE_IP = "93.184.216.34";
const WEBSITE_NAME = "wikipedia.org";
const MESSAGE = "Search: how to protect my privacy";

interface VantagePoint {
  id: string;
  label: string;
  description: string;
  intercepted: string[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  summary: { can: string[]; cannot: string[] };
}

const VANTAGE_POINTS: VantagePoint[] = [
  {
    id: "isp",
    label: "Alice's ISP",
    description:
      "You work at Alice's Internet Service Provider. You can monitor all traffic leaving her device.",
    intercepted: [
      `Traffic from ${ALICE_IP} → ${GUARD_IP}`,
      "Payload: [encrypted data, cannot read]",
      "Protocol: TLS connection to a known Tor Guard node",
    ],
    questions: [
      {
        question: "Can you determine which website Alice is visiting?",
        options: [
          "Yes, I can see the destination in the packet headers",
          "No, I can only see she's connecting to a Tor Guard node",
        ],
        correctIndex: 1,
        explanation:
          "You can see Alice is connecting to a Tor Guard node, but the actual destination website is hidden inside multiple layers of encryption.",
      },
      {
        question: "What do you know about Alice?",
        options: [
          "Her IP address and that she's using Tor",
          "Her IP address, the website she's visiting, and her message",
          "Nothing at all",
        ],
        correctIndex: 0,
        explanation:
          "You can see Alice's IP and that she's connecting to a known Tor relay, but you cannot see what she's doing or where she's going.",
      },
    ],
    summary: {
      can: [
        "Alice's IP address",
        "That she's using Tor (connecting to Guard node)",
      ],
      cannot: [
        "Which website she's visiting",
        "What message she's sending",
        "The full relay path",
      ],
    },
  },
  {
    id: "guard",
    label: "Guard Node",
    description:
      "You've compromised the Guard relay node. You can see all traffic passing through it.",
    intercepted: [
      `Incoming connection from: ${ALICE_IP}`,
      `After decrypting your layer: forward to ${MIDDLE_IP}`,
      "Remaining payload: [still encrypted, 2 layers remain]",
    ],
    questions: [
      {
        question: "Can you determine the final destination website?",
        options: [
          "Yes, it's in the decrypted payload",
          "No, I only see the next hop (Middle node)",
        ],
        correctIndex: 1,
        explanation:
          "After removing your encryption layer, you only learn the Middle node's address. The destination is still hidden under 2 more encryption layers.",
      },
      {
        question: "Can you read Alice's message?",
        options: [
          "Yes, I decrypted a layer so I can see it",
          "No, the message is still encrypted under 2 more layers",
        ],
        correctIndex: 1,
        explanation:
          "You only peeled one layer. The message is still wrapped in the Middle and Exit node's encryption. You can't read it.",
      },
    ],
    summary: {
      can: [
        "Alice's IP address (who is sending)",
        "The Middle node's address (next hop)",
      ],
      cannot: [
        "The destination website",
        "The message content",
        "The Exit node's identity",
      ],
    },
  },
  {
    id: "middle",
    label: "Middle Node",
    description:
      "You've compromised the Middle relay node. You can see all traffic passing through it.",
    intercepted: [
      `Incoming connection from: ${GUARD_IP}`,
      `After decrypting your layer: forward to ${EXIT_IP}`,
      "Remaining payload: [still encrypted, 1 layer remains]",
    ],
    questions: [
      {
        question: "Do you know who originally sent this traffic?",
        options: [
          "Yes, it's whoever connected to the Guard",
          "No, I only see the Guard's IP, not the original sender",
        ],
        correctIndex: 1,
        explanation:
          "You only know the traffic came from the Guard node. Many users could be sending traffic through that same Guard. You have no way to identify Alice.",
      },
      {
        question: "Do you know where this traffic is ultimately going?",
        options: [
          "Yes, the Exit node will send it to the destination",
          "No, I only know the next hop is the Exit node, not the final destination",
        ],
        correctIndex: 1,
        explanation:
          "You know to forward to the Exit node, but the final destination website is still encrypted inside the last layer. You're the most 'blind' node in the circuit.",
      },
    ],
    summary: {
      can: [
        "Guard node's address (previous hop)",
        "Exit node's address (next hop)",
      ],
      cannot: [
        "Alice's IP address (who is sending)",
        "The destination website",
        "The message content",
      ],
    },
  },
  {
    id: "exit",
    label: "Exit Node",
    description:
      "You've compromised the Exit relay node. You can see all traffic leaving the Tor network.",
    intercepted: [
      `Incoming connection from: ${MIDDLE_IP}`,
      `After decrypting your layer: send to ${WEBSITE_IP} (${WEBSITE_NAME})`,
      `Message content: "${MESSAGE}"`,
    ],
    questions: [
      {
        question: "Can you determine who sent this message?",
        options: [
          "Yes, I can trace it back to Alice",
          "No, I only see the Middle node's IP, which could be forwarding for anyone",
        ],
        correctIndex: 1,
        explanation:
          "You can see the message and the destination, but the sender is hidden. The traffic came from the Middle node, which could be forwarding for anyone. You have no way to link this to Alice.",
      },
      {
        question: "What can you do with the information you have?",
        options: [
          "I can see WHAT and WHERE, but not WHO. I cannot link the message to any person",
          "I know everything, I can identify Alice, the message, and the website",
        ],
        correctIndex: 0,
        explanation:
          "You see the content and destination but can't identify the sender. This is the key trade-off at the Exit: you know the what but not the who.",
      },
    ],
    summary: {
      can: [
        "The destination website",
        "The message content",
        "Middle node's address",
      ],
      cannot: [
        "Alice's IP address",
        "The Guard node's identity",
        "Who originally sent the message",
      ],
    },
  },
];

/* ───────── SVG diagram ───────── */

const SVG_W = 800;
const SVG_H = 270;
const PAD_X = 80;
const PAD_Y = 40;

interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

const DIAGRAM_NODES: DiagramNode[] = [
  { id: "alice", label: "Alice", x: 0, y: 80 },
  { id: "guard", label: "Guard", x: 25, y: 20 },
  { id: "middle", label: "Middle", x: 50, y: 80 },
  { id: "exit", label: "Exit", x: 75, y: 20 },
  { id: "website", label: "Website", x: 100, y: 80 },
];

const DIAGRAM_CONNS: [string, string][] = [
  ["alice", "guard"],
  ["guard", "middle"],
  ["middle", "exit"],
  ["exit", "website"],
];

function toSvg(xPct: number, yPct: number) {
  return {
    x: PAD_X + (xPct / 100) * (SVG_W - PAD_X * 2),
    y: PAD_Y + (yPct / 100) * (SVG_H - PAD_Y * 2),
  };
}

const NODE_COLORS: Record<string, string> = {
  alice: "#6366f1",
  guard: "#ef4444",
  middle: "#22c55e",
  exit: "#3b82f6",
  website: "#8b5cf6",
};

function NodeSvgIcon({
  nodeId,
  x,
  y,
}: {
  nodeId: string;
  x: number;
  y: number;
}) {
  const color = NODE_COLORS[nodeId] || "#6b7280";
  const s = 10;
  switch (nodeId) {
    case "alice":
      return (
        <g>
          <rect
            x={x - s}
            y={y - s + 1}
            width={s * 2}
            height={s * 1.4}
            rx={2}
            stroke={color}
            strokeWidth="1.5"
            fill="none"
          />
          <line
            x1={x - s + 2}
            y1={y + s * 0.7}
            x2={x + s - 2}
            y2={y + s * 0.7}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      );
    case "guard":
      return (
        <path
          d={`M${x},${y - s} L${x - s},${y - s + 5} L${x - s},${y + 2} Q${x},${y + s + 2} ${x},${y + s + 2} Q${x},${y + s + 2} ${x + s},${y + 2} L${x + s},${y - s + 5} Z`}
          stroke={color}
          strokeWidth="1.5"
          fill={color + "20"}
        />
      );
    case "middle":
      return (
        <g>
          <path
            d={`M${x - s},${y - 4} L${x - 3},${y - 4} L${x + 3},${y + 4} L${x + s},${y + 4}`}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M${x - s},${y + 4} L${x - 3},${y + 4} L${x + 3},${y - 4} L${x + s},${y - 4}`}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "exit":
      return (
        <g>
          <rect
            x={x - s}
            y={y - s}
            width={s * 1.3}
            height={s * 2}
            rx={1}
            stroke={color}
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d={`M${x + 2},${y} L${x + s},${y} M${x + s},${y} L${x + s - 3},${y - 3} M${x + s},${y} L${x + s - 3},${y + 3}`}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    case "website":
      return (
        <g>
          <circle
            cx={x}
            cy={y}
            r={s}
            stroke={color}
            strokeWidth="1.5"
            fill="none"
          />
          <ellipse
            cx={x}
            cy={y}
            rx={s * 0.45}
            ry={s}
            stroke={color}
            strokeWidth="1"
            fill="none"
          />
          <line
            x1={x - s}
            y1={y}
            x2={x + s}
            y2={y}
            stroke={color}
            strokeWidth="1"
          />
        </g>
      );
    default:
      return (
        <circle
          cx={x}
          cy={y}
          r={s}
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
      );
  }
}

function CircuitDiagram({ activeId }: { activeId: string | null }) {
  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto">
      {DIAGRAM_CONNS.map(([from, to]) => {
        const fromNode = DIAGRAM_NODES.find((n) => n.id === from)!;
        const toNode = DIAGRAM_NODES.find((n) => n.id === to)!;
        const fromPos = toSvg(fromNode.x, fromNode.y);
        const toPos = toSvg(toNode.x, toNode.y);
        return (
          <line
            key={`${from}-${to}`}
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke="#d1d5db"
            strokeWidth={2}
            strokeDasharray="8 4"
          />
        );
      })}
      {DIAGRAM_NODES.map((node) => {
        const pos = toSvg(node.x, node.y);
        const isActive = node.id === activeId;
        const isIspHighlight = activeId === "isp" && node.id === "alice";
        const highlighted = isActive || isIspHighlight;
        return (
          <g key={node.id}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={32}
              fill={highlighted ? "#fef2f2" : "#f9fafb"}
              stroke={highlighted ? "#ef4444" : "#d1d5db"}
              strokeWidth={highlighted ? 3 : 2}
            />
            <NodeSvgIcon nodeId={node.id} x={pos.x} y={pos.y} />
            <text
              x={pos.x}
              y={pos.y + 50}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill={highlighted ? "#dc2626" : "#374151"}
            >
              {node.label}
            </text>
            {highlighted && (
              <text
                x={pos.x}
                y={pos.y - 42}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill="#dc2626"
              >
                YOU
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ───────── phases ───────── */

type Phase = "intro" | "pick-position" | "intercept" | "questions" | "reveal";

export default function AttackerChallenge() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [vantage, setVantage] = useState<VantagePoint | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [completedPositions, setCompletedPositions] = useState<Set<string>>(
    new Set(),
  );

  const pickPosition = useCallback((v: VantagePoint) => {
    setVantage(v);
    setCurrentQ(0);
    setAnswered(null);
    setScore(0);
    setPhase("intercept");
  }, []);

  const answerQuestion = useCallback(
    (optionIdx: number) => {
      if (answered !== null || !vantage) return;
      setAnswered(optionIdx);
      if (optionIdx === vantage.questions[currentQ].correctIndex) {
        setScore((s) => s + 1);
      }
    },
    [answered, vantage, currentQ],
  );

  const nextQuestion = useCallback(() => {
    if (!vantage) return;
    if (currentQ + 1 < vantage.questions.length) {
      setCurrentQ((q) => q + 1);
      setAnswered(null);
    } else {
      setCompletedPositions((prev) => new Set([...prev, vantage.id]));
      setPhase("reveal");
    }
  }, [currentQ, vantage]);

  const backToPositions = useCallback(() => {
    setPhase("pick-position");
    setVantage(null);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {/* ════════ INTRO ════════ */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="text-center mb-8">
              <span className="mb-4 block flex justify-center">
                <DetectiveIcon size={48} />
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Can you break Tor?
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                Alice is sending a private message through the Tor network.
                You&apos;re an attacker trying to figure out what she&apos;s
                doing. Pick a position in the network to eavesdrop from, and see
                if you can uncover her identity, her message, or her
                destination.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-8">
              <CircuitDiagram activeId={null} />
            </div>

            <div className="text-center">
              <button
                onClick={() => setPhase("pick-position")}
                className="px-6 py-3 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Start eavesdropping →
              </button>
            </div>
          </motion.div>
        )}

        {/* ════════ PICK POSITION ════════ */}
        {phase === "pick-position" && (
          <motion.div
            key="pick-position"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Choose your vantage point
            </h2>
            <p className="text-gray-600 mb-6">
              Where in the network do you want to eavesdrop? Pick a position to
              see what you can intercept.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {VANTAGE_POINTS.map((v) => {
                const done = completedPositions.has(v.id);
                return (
                  <button
                    key={v.id}
                    onClick={() => pickPosition(v)}
                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                      done
                        ? "border-gray-200 bg-gray-50"
                        : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                    }`}
                  >
                    <NodeIcon nodeId={v.id} size={32} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {v.label}
                        </span>
                        {done && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                            completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {v.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {completedPositions.size === 4 && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-4 mb-6">
                <p className="text-sm font-medium text-violet-900">
                  <span className="font-bold">
                    You&apos;ve tried all positions!
                  </span>{" "}
                  No single vantage point reveals the full picture, that&apos;s
                  why we use onion routing.
                </p>
              </div>
            )}

            {completedPositions.size > 0 && (
              <div className="text-center">
                <Link
                  href="/response"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                >
                  Continue to Part 2: The Response →
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════ INTERCEPT ════════ */}
        {phase === "intercept" && vantage && (
          <motion.div
            key="intercept"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Eavesdropping as: {vantage.label}
            </h2>
            <p className="text-gray-600 mb-4">{vantage.description}</p>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-6">
              <CircuitDiagram activeId={vantage.id} />
            </div>

            <div className="bg-gray-900 rounded-xl p-5 mb-6">
              <p className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-wider">
                Intercepted traffic
              </p>
              {vantage.intercepted.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.4 }}
                  className="font-mono text-sm text-green-400 mb-2"
                >
                  <span className="text-green-600 mr-2">&gt;</span>
                  {line}
                </motion.div>
              ))}
            </div>

            <p className="text-gray-600 mb-4">
              Based on what you intercepted, can you answer these questions?
            </p>

            <button
              onClick={() => setPhase("questions")}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Answer questions →
            </button>
          </motion.div>
        )}

        {/* ════════ QUESTIONS ════════ */}
        {phase === "questions" && vantage && (
          <motion.div
            key={`questions-${currentQ}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {vantage.label}: Question {currentQ + 1}/
                {vantage.questions.length}
              </h2>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
              <p className="font-semibold text-gray-900 mb-4">
                {vantage.questions[currentQ].question}
              </p>

              <div className="space-y-3">
                {vantage.questions[currentQ].options.map((option, i) => {
                  const isCorrect =
                    i === vantage.questions[currentQ].correctIndex;
                  const isSelected = answered === i;
                  let style =
                    "border-gray-200 hover:border-gray-300 cursor-pointer";
                  if (answered !== null) {
                    if (isCorrect) style = "border-green-500 bg-green-50";
                    else if (isSelected) style = "border-red-500 bg-red-50";
                    else style = "border-gray-200 opacity-50";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => answerQuestion(i)}
                      disabled={answered !== null}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${style}`}
                    >
                      <span className="text-sm text-gray-800">{option}</span>
                      {answered !== null && isCorrect && (
                        <span className="ml-2 text-green-600 font-bold">
                          Correct
                        </span>
                      )}
                      {answered !== null && isSelected && !isCorrect && (
                        <span className="ml-2 text-red-600 font-bold">
                          Wrong
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {answered !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <p className="text-sm text-gray-700">
                      {vantage.questions[currentQ].explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {answered !== null && (
              <button
                onClick={nextQuestion}
                className="px-6 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {currentQ + 1 < vantage.questions.length
                  ? "Next question →"
                  : "See results →"}
              </button>
            )}
          </motion.div>
        )}

        {/* ════════ REVEAL ════════ */}
        {phase === "reveal" && vantage && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Results: {vantage.label}
            </h2>
            <p className="text-gray-600 mb-6">
              Here&apos;s what you could and couldn&apos;t figure out from the{" "}
              {vantage.label} position.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <p className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                  <EyeIcon size={16} /> What you CAN see
                </p>
                <ul className="space-y-2">
                  {vantage.summary.can.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-red-700"
                    >
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-red-200 inline-block flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <p className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                  <LockIcon size={16} /> What you CANNOT see
                </p>
                <ul className="space-y-2">
                  {vantage.summary.cannot.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-green-700"
                    >
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-green-200 inline-block flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-4 mb-8">
              <p className="text-sm font-medium text-violet-900">
                <span className="font-bold">Remember:</span>{" "}
                {vantage.id === "isp"
                  ? "The ISP knows Alice is using Tor but is completely blind to what she's doing or where she's going, that's the power of onion routing."
                  : vantage.id === "guard"
                    ? "The Guard knows WHO (Alice) but not WHAT or WHERE."
                    : vantage.id === "middle"
                      ? "The Middle node is the most blind, it knows neither the sender nor the destination."
                      : "The Exit knows WHAT and WHERE but not WHO, it cannot trace the traffic back to Alice."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={backToPositions}
                className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                ← Try another position
              </button>
              {completedPositions.size >= 2 && (
                <Link
                  href="/response"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                >
                  Continue to Part 2: The Response →
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
