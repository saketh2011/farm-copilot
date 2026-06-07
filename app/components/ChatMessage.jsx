"use client";

function formatContent(content) {
  if (!content) return "";
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

export default function ChatMessage({ role, content }) {
  const isUser = role === "user";
  const formatted = formatContent(content);

  return (
    <div className={`message-row ${isUser ? "user-row" : "assistant-row"}`}>
      {!isUser && <div className="avatar assistant-avatar" aria-hidden="true">🌾</div>}
      <div className={`bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}>
        {isUser ? (
          <span>{content}</span>
        ) : (
          <div className="assistant-content" dangerouslySetInnerHTML={{ __html: `<p>${formatted}</p>` }} />
        )}
      </div>
      {isUser && <div className="avatar user-avatar" aria-hidden="true">👤</div>}

      <style jsx>{`
        .message-row { display: flex; gap: 10px; margin: 6px 0; max-width: 100%; }
        .user-row { flex-direction: row-reverse; }
        .assistant-row { flex-direction: row; }
        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0; margin-top: 2px;
        }
        .assistant-avatar { background: rgba(122,170,92,0.12); border: 1px solid rgba(122,170,92,0.2); }
        .user-avatar { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }
        .bubble { max-width: 78%; padding: 12px 16px; border-radius: 16px; font-size: 14.5px; line-height: 1.65; }
        .user-bubble { background: #1e3d12; border: 1px solid rgba(122,170,92,0.2); color: #c8f0a8; border-bottom-right-radius: 4px; }
        .assistant-bubble { background: #111f0d; border: 1px solid rgba(255,255,255,0.06); color: #a8c890; border-bottom-left-radius: 4px; }
        .assistant-content :global(p) { margin: 0 0 8px; }
        .assistant-content :global(p:last-child) { margin-bottom: 0; }
        .assistant-content :global(h2), .assistant-content :global(h3) { color: #b8e89a; margin: 12px 0 6px; font-weight: 600; }
        .assistant-content :global(h2) { font-size: 15px; }
        .assistant-content :global(h3) { font-size: 14px; }
        .assistant-content :global(strong) { color: #c8f0a8; font-weight: 600; }
        .assistant-content :global(code) { background: rgba(122,170,92,0.1); color: #9ad878; padding: 1px 5px; border-radius: 4px; font-size: 13px; }
        .assistant-content :global(ul) { padding-left: 18px; margin: 6px 0; }
        .assistant-content :global(li) { margin: 3px 0; }
        @media (max-width: 600px) { .bubble { max-width: 88%; font-size: 14px; } }
      `}</style>
    </div>
  );
}