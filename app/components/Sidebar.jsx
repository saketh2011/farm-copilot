"use client";

const QUICK_ACTIONS = [
  { icon: "💧", label: "Irrigation check", prompt: "Should I irrigate my fields today? My location is in central India (21.1°N, 79.0°E)" },
  { icon: "🪲", label: "Diagnose crop issue", prompt: "Help me diagnose a problem with my crops. My leaves are yellowing." },
  { icon: "💰", label: "Best time to sell", prompt: "I have wheat ready to sell. What are the current market prices and should I sell now?" },
  { icon: "🌱", label: "Soil health check", prompt: "Analyze the soil health for my farm at coordinates 28.6°N, 77.2°E and tell me what nutrients I need" },
  { icon: "🌾", label: "Fertilizer advice", prompt: "What fertilizer and nutrients does rice need during flowering stage?" },
  { icon: "🌡️", label: "Weather risk alert", prompt: "Check the weather forecast for my farm in Maharashtra India (19.7°N, 75.7°E) and flag any risks" },
];

export default function Sidebar({ open, onClose, onSelect }) {
  return (
    <>
      {open && <div className="overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>🌾</span>
            <span className="sidebar-title">CropPilot</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="section-label">Quick actions</div>
        <nav className="quick-actions">
          {QUICK_ACTIONS.map((a, i) => (
            <button key={i} className="action-btn" onClick={() => onSelect(a.prompt)}>
              <span className="action-icon">{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </nav>

        <div className="divider" />
        <div className="section-label">About</div>
        <div className="about-text">
          CropPilot uses real-time weather data from Open-Meteo, AI-powered soil analysis, and commodity market intelligence to give farmers actionable decisions.
        </div>
        <div className="powered-by">
          <span>Powered by</span>
          <span className="powered-chip">Groq · Llama 3.3</span>
        </div>

        <style jsx>{`
          .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
          .sidebar {
            position: fixed; left: 0; top: 0; bottom: 0; width: 260px;
            background: #0d1a0b; border-right: 1px solid rgba(122,170,92,0.1);
            z-index: 100; transform: translateX(-100%); transition: transform 0.25s ease;
            display: flex; flex-direction: column; padding: 20px 16px; overflow-y: auto;
          }
          .sidebar.open { transform: translateX(0); }
          .sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
          .sidebar-logo { display: flex; align-items: center; gap: 8px; font-size: 20px; }
          .sidebar-title { font-size: 17px; font-weight: 700; color: #b8e89a; }
          .close-btn { background: none; border: none; color: #3a5028; cursor: pointer; font-size: 16px; padding: 4px; }
          .close-btn:hover { color: #7aaa5c; }
          .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #2a3d1e; margin-bottom: 8px; font-weight: 600; }
          .quick-actions { display: flex; flex-direction: column; gap: 2px; margin-bottom: 20px; }
          .action-btn {
            display: flex; align-items: center; gap: 10px; padding: 9px 12px;
            background: none; border: none; border-radius: 8px; cursor: pointer;
            color: #6a8c54; font-size: 13.5px; font-family: inherit; text-align: left; transition: all 0.12s;
          }
          .action-btn:hover { background: rgba(122,170,92,0.08); color: #a8c890; }
          .action-icon { font-size: 16px; flex-shrink: 0; }
          .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 8px 0 16px; }
          .about-text { font-size: 12px; color: #3a5028; line-height: 1.6; margin-bottom: 20px; }
          .powered-by { margin-top: auto; display: flex; align-items: center; gap: 8px; font-size: 11px; color: #2a3d1e; }
          .powered-chip { padding: 2px 8px; background: rgba(122,170,92,0.06); border: 1px solid rgba(122,170,92,0.1); border-radius: 20px; color: #4a6b38; }
        `}</style>
      </aside>
    </>
  );
}