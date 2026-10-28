import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { Bus, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatAssistant } from "@/lib/site.functions";
import { waLink } from "@/lib/company";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm Faswa 👋 Where would you like to travel or send goods today?" },
  ]);
  const ask = useServerFn(chatAssistant);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    if (open && !busy) inputRef.current?.focus();
  }, [messages, open, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await ask({ data: { messages: next.slice(-20) } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong. Please reach us on WhatsApp." }]);
    } finally {
      setBusy(false);
    }
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[32rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-card shadow-lift">
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground">
              <Bus className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-display text-sm">Faswa Assistant</p>
              <p className="text-xs opacity-80">Usually replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">{m.content}</div>
              ) : (
                <div key={i} className="max-w-[90%] text-foreground [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-4">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ),
            )}
            {busy && <p className="animate-pulse text-muted-foreground">Faswa is typing…</p>}
            <div ref={endRef} />
          </div>
          <div className="border-t p-3 space-y-2">
            <Button asChild variant="whatsapp" className="w-full">
              <a href={waLink(`Hello FASWA, ${lastUser ?? "I'd like to make an enquiry."}`)} target="_blank" rel="noreferrer">
                <MessageCircle /> Chat on WhatsApp
              </a>
            </Button>
            <form onSubmit={send} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about routes, prices…"
                className="flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send"><Send /></Button>
            </form>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open assistant"
        className="fixed bottom-4 right-4 z-50 grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-foreground shadow-lift transition-transform hover:scale-105"
      >
        {open ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </>
  );
}
