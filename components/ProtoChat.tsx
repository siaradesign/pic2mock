"use client";
import { useRef, useState } from "react";

export default function ProtoChat() {
  const [loading, setLoading] = useState(false);
  const outRef = useRef<HTMLPreElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value.trim();
    if (!q) return;

    setLoading(true);
    outRef.current!.textContent = "";

    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: q }),
    });

    const reader = resp.body?.getReader();
    const decoder = new TextDecoder();
    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      outRef.current!.textContent += decoder.decode(value, { stream: true });
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "24px auto", fontFamily: "system-ui" }}>
      <h3>Chat with Proto</h3>
      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          name="q"
          placeholder="Describe your product/mockup idea…"
          style={{ flex: 1, padding: 10 }}
        />
        <button disabled={loading}>{loading ? "Thinking…" : "Send"}</button>
      </form>
      <pre
        ref={outRef}
        style={{
          whiteSpace: "pre-wrap",
          padding: 12,
          border: "1px solid #eee",
          marginTop: 12,
        }}
      />
    </div>
  );
}
