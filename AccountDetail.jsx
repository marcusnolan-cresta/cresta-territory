import { useState } from "react";

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="detail-section">
      <button className="section-toggle" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="toggle-icon">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
};

const TechBadge = ({ label, confirmed }) => (
  <span className={`tech-badge ${confirmed ? "confirmed" : "inferred"}`}>
    {confirmed ? "✓" : "~"} {label}
  </span>
);

const GongCall = ({ call }) => {
  const typeColors = {
    "Demo": "#1E7F45",
    "Meeting Booked": "#1E7F45",
    "Cold Call Connected": "#1E6FBF",
    "Cold Call — WARM": "#C9A84C",
    "Cold Call Blocked": "#B71C1C",
    "Cold Call VM": "#666",
    "Cold Call Voicemail": "#666",
    "Cold Call — VM": "#666",
    "Cold Call — Rejected": "#B71C1C",
    "Cold Call — Wrong Person": "#888",
    "Internal Prep": "#888",
    "Intelligence": "#C9A84C",
  };
  return (
    <div className="gong-call">
      <div className="gong-call-header">
        <span className="gong-type" style={{ color: typeColors[call.type] || "#888" }}>{call.type}</span>
        <span className="gong-date">{call.date}</span>
        {call.url && <a href={call.url} target="_blank" rel="noopener noreferrer" className="gong-link">▶ Open in Gong</a>}
      </div>
      <div className="gong-contact">{call.contact}</div>
      <div className="gong-summary">{call.summary}</div>
    </div>
  );
};

export default function AccountDetail({ account, onClose }) {
  const {
    name, parent, domain, sfdc, priority, vertical, status,
    hq, employees, revenue, last_activity, quick_context, next_step,
    group_structure, financials, tech_stack, key_execs, champions,
    blockers, cc_footprint, regulatory_signals, gong_history,
    use_cases, best_case_study, narrative, outreach_angle
  } = account;

  const priorityClass = { A: "p-a", B: "p-b", C: "p-c" }[priority];

  return (
    <div className="detail-view">
      {/* ── HEADER ── */}
      <div className="detail-header">
        <button className="close-btn" onClick={onClose}>← Back</button>
        <div className="detail-title-row">
          <span className={`priority-pill large ${priorityClass}`}>{priority}</span>
          <h1 className="detail-name">{name}</h1>
          <div className="detail-status-badges">
            <span className="vertical-badge">{vertical}</span>
            <span className="status-badge">{status}</span>
          </div>
        </div>
        <div className="detail-meta">
          <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="detail-link">{domain}</a>
          <a href={sfdc} target="_blank" rel="noopener noreferrer" className="detail-link sfdc-link">Open in Salesforce ↗</a>
          <span className="detail-meta-item">📍 {hq}</span>
          <span className="detail-meta-item">👥 {employees}</span>
          <span className="detail-meta-item">💰 {revenue}</span>
        </div>
      </div>

      {/* ── NEXT STEP CALLOUT ── */}
      <div className="next-step-callout">
        <div className="next-step-label">🎯 RECOMMENDED NEXT STEP</div>
        <div className="next-step-text">{next_step}</div>
      </div>

      {/* ── OUTREACH ANGLE ── */}
      <div className="outreach-callout">
        <div className="outreach-label">💬 OUTREACH ANGLE</div>
        <div className="outreach-text">{outreach_angle}</div>
      </div>

      {/* ── SECTIONS ── */}
      <div className="detail-sections">

        <Section title="🏢 Group Structure & Financials">
          <div className="two-col">
            <div>
              <h4>Group Structure</h4>
              <p className="detail-text">{group_structure}</p>
            </div>
            <div>
              <h4>Financials</h4>
              <p className="detail-text">{financials}</p>
            </div>
          </div>
        </Section>

        <Section title="💻 Tech Stack">
          <div className="tech-legend">
            <span className="tech-badge confirmed">✓ Confirmed</span>
            <span className="tech-badge inferred">~ Inferred / Hypothesis</span>
          </div>
          <div className="tech-grid">
            {(tech_stack.confirmed || []).map(t => <TechBadge key={t} label={t} confirmed />)}
            {(tech_stack.inferred || []).map(t => <TechBadge key={t} label={t} confirmed={false} />)}
          </div>
        </Section>

        <Section title="👥 People & Relationships">
          <div className="three-col">
            <div>
              <h4>Key Executives</h4>
              {key_execs.map((e, i) => (
                <div key={i} className="exec-row">
                  <span className="exec-name">{e.name}</span>
                  <span className="exec-title">{e.title}</span>
                </div>
              ))}
            </div>
            <div>
              <h4>Champions</h4>
              <p className="detail-text">{champions}</p>
            </div>
            <div>
              <h4>Blockers / Risks</h4>
              <p className="detail-text blockers">{blockers}</p>
            </div>
          </div>
        </Section>

        <Section title="📞 CC Footprint & Regulatory Signals">
          <div className="two-col">
            <div>
              <h4>Contact Centre Footprint</h4>
              <p className="detail-text">{cc_footprint}</p>
            </div>
            <div>
              <h4>Regulatory / Fine Signals</h4>
              <p className="detail-text regulatory">{regulatory_signals}</p>
            </div>
          </div>
        </Section>

        <Section title={`📞 Gong Call History (${gong_history?.length || 0} calls)`}>
          {gong_history && gong_history.length > 0 ? (
            <div className="gong-list">
              {[...gong_history].reverse().map((call, i) => (
                <GongCall key={i} call={call} />
              ))}
            </div>
          ) : (
            <div className="no-calls">No Gong calls logged for this account yet.</div>
          )}
        </Section>

        <Section title="🎯 Cresta Positioning">
          <div className="positioning-grid">
            <div>
              <h4>Executive Narrative</h4>
              <p className="detail-text narrative">{narrative}</p>
            </div>
            <div>
              <h4>Best-Fit Use Cases</h4>
              <ul className="use-case-list">
                {use_cases.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </div>
            <div>
              <h4>Best Case Study</h4>
              <p className="detail-text case-study">{best_case_study}</p>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
