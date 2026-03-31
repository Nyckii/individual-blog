"use client";

import { motion } from "framer-motion";

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export default function MessageInput({
  value,
  onChange,
  label = "Type your own message to send through the Tor network:",
  placeholder = "Hello, website!",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6"
    >
      <label
        htmlFor="user-message"
        className="block text-sm font-medium text-amber-800 mb-2"
      >
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          id="user-message"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={50}
          className="flex-1 px-4 py-2 rounded-lg border border-amber-300 bg-white text-gray-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400"
        />
        <span className="text-xs text-amber-600 whitespace-nowrap">
          {value.length}/50
        </span>
      </div>
      <p className="text-xs text-amber-600 mt-2">
        Watch your message get encrypted layer by layer as it travels through the network!
      </p>
    </motion.div>
  );
}
