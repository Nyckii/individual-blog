"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    question:
      "Which node knows neither the sender (Alice) nor the destination website?",
    options: ["Guard Node", "Middle Node", "Exit Node"],
    correctIndex: 1,
    explanation:
      "The Middle Node only knows the Guard's address and the Exit's address. It has no idea who started the request or where it's ultimately going. It just passes encrypted data along.",
  },
  {
    question: "Which node knows Alice's real IP address?",
    options: ["Guard Node", "Middle Node", "Exit Node"],
    correctIndex: 0,
    explanation:
      "The Guard Node is Alice's first point of contact, so it can see her IP address. But it can't see the message content or the final destination.",
  },
  {
    question: "Which node can read the actual message content?",
    options: ["Guard Node", "Middle Node", "Exit Node"],
    correctIndex: 2,
    explanation:
      "The Exit Node peels the last encryption layer and sees the plaintext message and destination. But it doesn't know who originally sent it. It only knows the Middle Node's address.",
  },
  {
    question:
      "If an attacker controls the Guard Node, can they see which website Alice is visiting?",
    options: [
      "Yes, the Guard can see everything",
      "No, the Guard only knows Alice's IP, not the destination",
      "Only if they also control the Exit Node",
    ],
    correctIndex: 1,
    explanation:
      "The Guard only peels the outermost encryption layer, which reveals the Middle Node's address, not the destination. The website address is still encrypted inside the remaining layers.",
  },
  {
    question: "Why does Tor use exactly 3 relay nodes?",
    options: [
      "More nodes would be too slow; fewer wouldn't separate knowledge enough",
      "3 is the maximum number of encryption layers possible",
      "It's a random choice with no specific reason",
    ],
    correctIndex: 0,
    explanation:
      "3 hops is a balance between privacy and performance. With 3 nodes, knowledge is split so no single node sees both sender and destination. More hops would add latency without much extra security.",
  },
];

export default function Quiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[currentQ];

  function handleSelect(index: number) {
    if (selected !== null) return; // already answered
    setSelected(index);
    if (index === q.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function handleRestart() {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 mt-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Quiz Complete!
        </h3>
        <p className="text-gray-600 mb-4">
          You got{" "}
          <span className="font-bold text-violet-600">
            {score} out of {QUESTIONS.length}
          </span>{" "}
          correct.
        </p>
        {score === QUESTIONS.length ? (
          <p className="text-green-700 font-medium mb-4">
            Perfect score! You fully understand how onion routing protects
            privacy.
          </p>
        ) : score >= 3 ? (
          <p className="text-amber-700 font-medium mb-4">
            Great job! You have a solid understanding. Review the steps above for
            the ones you missed.
          </p>
        ) : (
          <p className="text-red-700 font-medium mb-4">
            You might want to go through the steps again. Pay attention to what
            each node can and cannot see!
          </p>
        )}
        <button
          onClick={handleRestart}
          className="px-5 py-2 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 mt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Test Your Understanding
        </h3>
        <span className="text-sm text-gray-400">
          {currentQ + 1} / {QUESTIONS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-gray-800 font-medium mb-4">{q.question}</p>

          <div className="space-y-2">
            {q.options.map((option, i) => {
              let style =
                "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700";

              if (selected !== null) {
                if (i === q.correctIndex) {
                  style =
                    "border-green-400 bg-green-50 text-green-800";
                } else if (i === selected && i !== q.correctIndex) {
                  style =
                    "border-red-400 bg-red-50 text-red-800";
                } else {
                  style =
                    "border-gray-200 bg-gray-50 text-gray-400";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${style} ${
                    selected === null ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Explanation after answering */}
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4"
            >
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  selected === q.correctIndex
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-amber-50 border border-amber-200 text-amber-800"
                }`}
              >
                <span className="font-bold">
                  {selected === q.correctIndex ? "Correct! " : "Not quite. "}
                </span>
                {q.explanation}
              </div>

              <button
                onClick={handleNext}
                className="mt-3 px-5 py-2 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                {currentQ < QUESTIONS.length - 1
                  ? "Next Question"
                  : "See Results"}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
