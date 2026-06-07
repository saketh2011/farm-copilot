"use client";
import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/ChatMessage";
import ToolBadge from "./components/ToolBadge";
import Sidebar from "./components/Sidebar";

const SUGGESTED_PROMPTS = [
  {
    icon: "🌧️",
    text: "Should I irrigate my wheat field today? I'm in Punjab, India (30.9°N, 75.8°E)",
  },
  {
    icon: "🪲",
    text: "My tomato leaves have yellow spots and the edges are curling. What's wrong?",
  },
  {
    icon: "💰",
    text: "I have 10 tons of rice ready. Should I sell now or wait?",
  },
  {
    icon: "🌱",
    text: "What fertilizer does corn need at the tasseling stage?",
  },
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toolsUsed, setToolsUsed] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    setToolsUsed([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.message },
      ]);
      setToolsUsed(data.toolsUsed || []);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser. Use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (e) => {
      console.error("Voice error:", e.error);
    };
    recognition.start();
  };

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(text) => {
          setSidebarOpen(false);
          sendMessage(text);
        }}
      />

      <div className="main-area">
        <header className="topbar">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="logo-group">
            <div className="logo-icon">🌾</div>
            <div>
              <h1 className="logo-text">CropPilot</h1>
              <p className="logo-sub">AI Farm Co-pilot</p>
            </div>
          </div>
          <div className="status-dot" title="Online" />
        </header>

        <div className="chat-area">
          {messages.length === 0 && (
            <div className="welcome">
              <div className="welcome-icon">🌱</div>
              <h2 className="welcome-title">What's happening on your farm?</h2>
              <p className="welcome-sub">
                Ask me about irrigation, crop disease, market prices, soil
                health, or anything else.
              </p>
              <div className="suggestions">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    className="suggestion-btn"
                    onClick={() => sendMessage(p.text)}
                  >
                    <span className="suggestion-icon">{p.icon}</span>
                    <span>{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}

          {loading && (
            <div className="thinking">
              <div className="thinking-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="thinking-text">Analyzing your farm data…</span>
            </div>
          )}

          {toolsUsed.length > 0 && (
            <div className="tools-used">
              <span className="tools-label">Data sources used:</span>
              {toolsUsed.map((t, i) => (
                <ToolBadge key={i} tool={t} />
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your crops, weather, soil, or markets…"
              rows={1}
              disabled={loading}
            />
            <button
              className="mic-btn"
              onClick={startVoice}
              aria-label="Voice input"
              type="button"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
            <button
              className={`send-btn ${loading || !input.trim() ? "disabled" : ""}`}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="input-hint">
            CropPilot uses real weather data and agronomic AI. Not a substitute
            for professional advice.
          </p>
        </div>
      </div>

      <style jsx>{`
        .app-shell {
          display: flex;
          height: 100vh;
          background: #0a1208;
          font-family: "DM Sans", "Segoe UI", sans-serif;
          overflow: hidden;
        }
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: #0d1a0b;
        }
        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 4px;
        }
        .menu-btn span {
          display: block;
          width: 20px;
          height: 2px;
          background: #7aaa5c;
          border-radius: 2px;
        }
        .logo-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }
        .logo-icon {
          font-size: 28px;
        }
        .logo-text {
          font-size: 18px;
          font-weight: 700;
          color: #b8e89a;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .logo-sub {
          font-size: 11px;
          color: #4a6b38;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4caf50;
          box-shadow: 0 0 6px #4caf50;
        }
        .chat-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .chat-area::-webkit-scrollbar {
          width: 4px;
        }
        .chat-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-area::-webkit-scrollbar-thumb {
          background: #2a3d1e;
          border-radius: 2px;
        }
        .welcome {
          text-align: center;
          padding: 40px 20px;
          max-width: 600px;
          margin: auto;
        }
        .welcome-icon {
          font-size: 56px;
          margin-bottom: 16px;
        }
        .welcome-title {
          font-size: 26px;
          font-weight: 700;
          color: #c8f0a8;
          margin: 0 0 10px;
          letter-spacing: -0.5px;
        }
        .welcome-sub {
          font-size: 15px;
          color: #5a7a46;
          margin: 0 0 32px;
          line-height: 1.6;
        }
        .suggestions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }
        .suggestion-btn {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(122, 170, 92, 0.06);
          border: 1px solid rgba(122, 170, 92, 0.15);
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          color: #8aac70;
          font-size: 13.5px;
          line-height: 1.5;
          transition: all 0.15s;
          font-family: inherit;
        }
        .suggestion-btn:hover {
          background: rgba(122, 170, 92, 0.12);
          border-color: rgba(122, 170, 92, 0.3);
          color: #b8e89a;
        }
        .suggestion-icon {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .thinking {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          margin: 4px 0;
        }
        .thinking-dots {
          display: flex;
          gap: 4px;
        }
        .thinking-dots span {
          width: 6px;
          height: 6px;
          background: #4a6b38;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .thinking-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .thinking-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.4;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
        .thinking-text {
          font-size: 13px;
          color: #4a6b38;
          font-style: italic;
        }
        .tools-used {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          margin-top: 4px;
        }
        .tools-label {
          font-size: 11px;
          color: #3a5028;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .input-area {
          padding: 16px 20px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: #0d1a0b;
        }
        .input-wrapper {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          background: rgba(122, 170, 92, 0.06);
          border: 1px solid rgba(122, 170, 92, 0.2);
          border-radius: 14px;
          padding: 10px 10px 10px 16px;
          transition: border-color 0.15s;
        }
        .input-wrapper:focus-within {
          border-color: rgba(122, 170, 92, 0.4);
        }
        .chat-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: #c8f0a8;
          font-size: 14.5px;
          font-family: inherit;
          resize: none;
          line-height: 1.5;
          max-height: 120px;
          overflow-y: auto;
        }
        .chat-input::placeholder {
          color: #3a5028;
        }
        .send-btn {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #4a8c30;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .send-btn svg {
          width: 15px;
          height: 15px;
          color: white;
          margin-left: 1px;
        }
        .send-btn:hover:not(.disabled) {
          background: #5aaa3c;
          transform: scale(1.05);
        }
        .send-btn.disabled {
          background: #1e3014;
          cursor: not-allowed;
          opacity: 0.5;
        }
        .input-hint {
          font-size: 11px;
          color: #2a3d1e;
          margin: 8px 0 0;
          text-align: center;
        }
        @media (max-width: 600px) {
          .chat-area {
            padding: 16px 12px;
          }
          .input-area {
            padding: 12px 12px 16px;
          }
          .topbar {
            padding: 12px 16px;
          }
        }
      .mic-btn {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(122,170,92,0.1);
  border: 1px solid rgba(122,170,92,0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.mic-btn svg {
  width: 15px;
  height: 15px;
  color: #7aaa5c;
}
.mic-btn:hover {
  background: rgba(122,170,92,0.2);
  border-color: rgba(122,170,92,0.4);
}    
      `}</style>
    </div>
  );
}
