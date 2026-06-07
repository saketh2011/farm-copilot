"use client";

const TOOL_META = {
  get_weather: { icon: "🌤️", label: "Weather API" },
  get_soil_data: { icon: "🌍", label: "Soil Sensors" },
  get_crop_advice: { icon: "🌿", label: "Agronomy DB" },
  get_market_prices: { icon: "📈", label: "Market Data" },
  get_irrigation_recommendation: { icon: "💧", label: "Irrigation Model" },
};

export default function ToolBadge({ tool }) {
  const meta = TOOL_META[tool.name] || { icon: "⚙️", label: tool.name };
  return (
    <span className="badge">
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
      <style jsx>{`
        .badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px;
          background: rgba(122,170,92,0.08);
          border: 1px solid rgba(122,170,92,0.15);
          border-radius: 20px; font-size: 11px; color: #5a7a46;
        }
      `}</style>
    </span>
  );
}