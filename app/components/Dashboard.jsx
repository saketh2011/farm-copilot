"use client";

export default function Dashboard({ data }) {
  if (!data) return null;

  const { weather, soil } = data;

  const riskLevel = soil?.soil_moisture < 30 ? "high" : soil?.soil_moisture < 45 ? "medium" : "low";
  const riskColor = riskLevel === "high" ? "#e24b4a" : riskLevel === "medium" ? "#f0a500" : "#4caf50";
  const riskMsg = riskLevel === "high"
    ? "High irrigation urgency — irrigate today."
    : riskLevel === "medium"
    ? "Medium irrigation urgency — irrigate within 48h."
    : "Soil moisture is adequate — no irrigation needed.";

  const forecast = weather?.forecast_7day || [];

  const maxRain = Math.max(...forecast.map(d => d.precipitation || 0), 1);

  return (
    <div className="dashboard">
      <div className="db-header">
        <span className="db-title">Farm dashboard</span>
        {weather?.location && <span className="db-loc">📍 {weather.location}</span>}
      </div>

      {weather?.current && (
        <div className="db-grid">
          <div className="db-card">
            <div className="db-label">Temp</div>
            <div className="db-val">{weather.current.temperature}<span className="db-unit">°C</span></div>
          </div>
          <div className="db-card">
            <div className="db-label">Humidity</div>
            <div className="db-val">{weather.current.humidity}<span className="db-unit">%</span></div>
          </div>
          <div className="db-card">
            <div className="db-label">Soil moisture</div>
            <div className="db-val">{soil?.soil_moisture ?? "—"}<span className="db-unit">%</span></div>
          </div>
          <div className="db-card">
            <div className="db-label">Wind</div>
            <div className="db-val">{weather.current.wind_speed}<span className="db-unit">km/h</span></div>
          </div>
        </div>
      )}

      {soil && (
        <div className="db-risk" style={{ borderColor: `${riskColor}33` }}>
          <div className="db-risk-dot" style={{ background: riskColor }} />
          <span className="db-risk-text" style={{ color: riskColor }}>{riskMsg}</span>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="db-forecast">
          <div className="db-forecast-title">7-day rainfall forecast (mm)</div>
          <div className="db-bars">
            {forecast.map((day, i) => {
              const height = Math.max(4, ((day.precipitation || 0) / maxRain) * 100);
              const label = new Date(day.date).toLocaleDateString("en", { weekday: "short" });
              return (
                <div key={i} className="db-bar-wrap">
                  <div className="db-bar" style={{ height: `${height}%` }} />
                  <span className="db-bar-day">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {soil && (
        <div className="db-soil">
          <div className="db-card">
            <div className="db-label">Soil pH</div>
            <div className="db-val">{soil.pH}</div>
          </div>
          <div className="db-card">
            <div className="db-label">Nitrogen</div>
            <div className="db-val">{soil.nitrogen_ppm}<span className="db-unit">ppm</span></div>
          </div>
          <div className="db-card">
            <div className="db-label">Phosphorus</div>
            <div className="db-val">{soil.phosphorus_ppm}<span className="db-unit">ppm</span></div>
          </div>
          <div className="db-card">
            <div className="db-label">Organic matter</div>
            <div className="db-val">{soil.organic_matter_percent}<span className="db-unit">%</span></div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard {
          background: #0d1a0b;
          border-bottom: 1px solid rgba(122,170,92,0.1);
          padding: 14px 20px;
          font-family: 'DM Sans', sans-serif;
        }
        .db-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .db-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #3a5028;
          font-weight: 600;
        }
        .db-loc { font-size: 11px; color: #4a6b38; }
        .db-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 8px;
        }
        .db-card {
          background: #111f0d;
          border: 1px solid rgba(122,170,92,0.1);
          border-radius: 8px;
          padding: 8px 10px;
        }
        .db-label {
          font-size: 9px;
          color: #3a5028;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 3px;
        }
        .db-val {
          font-size: 18px;
          font-weight: 700;
          color: #b8e89a;
          line-height: 1;
        }
        .db-unit { font-size: 10px; color: #5a7a46; margin-left: 1px; }
        .db-risk {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #111f0d;
          border: 1px solid;
          border-radius: 8px;
          margin-bottom: 8px;
        }
        .db-risk-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .db-risk-text { font-size: 11px; }
        .db-forecast {
          background: #111f0d;
          border: 1px solid rgba(122,170,92,0.1);
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 8px;
        }
        .db-forecast-title {
          font-size: 9px;
          color: #3a5028;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .db-bars {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 44px;
        }
        .db-bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          height: 100%;
          justify-content: flex-end;
        }
        .db-bar {
          width: 100%;
          background: rgba(122,170,92,0.25);
          border-radius: 2px 2px 0 0;
          border-top: 1px solid rgba(122,170,92,0.4);
          min-height: 3px;
        }
        .db-bar-day { font-size: 8px; color: #3a5028; }
        .db-soil {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        @media (max-width: 600px) {
          .db-grid { grid-template-columns: repeat(2, 1fr); }
          .db-soil { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}