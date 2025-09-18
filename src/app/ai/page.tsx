"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function AIChatPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isLoading } = useChat();

  return (
    <div className="flex flex-col w-full max-w-2xl py-12 mx-auto gap-4">
      <h1 className="text-2xl font-bold">AI Chat (Gemini)</h1>

      <div className="flex flex-col gap-2">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <span className="font-semibold mr-2">{m.role === "user" ? "User:" : "AI:"}</span>
            {m.parts.map((part) => (part.type === "text" ? part.text : "")).join("")}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 p-2 border border-gray-300 rounded"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

