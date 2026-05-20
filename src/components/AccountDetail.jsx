import { useState } from "react";

const Section = ({ title, icon, children, defaultOpen = true, accent }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`detail-section${accent ? ` accent-${accent}` : ""}`}>
      <button className="section-toggle" onClick={() => setOpen(!open)}>
        <span className="section-toggle-left">{icon && <span className="section-icon">{icon}</span>}{title}</span>
        <span className="toggle-icon">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
};

const Field = ({ label, value, highlight }) => {
  if (!value || value === "Unknown" || value === "") return null;
  return (
    <div className={`field-row${highlight ? " field-highlight" : ""}`}>
      <span className="field-label">{label}</span>
      <span className="field-value">{value}</span>
    </div>
  );
};

const TechBadge = ({ label, confirmed }) => (
  <span className={`tech-badge ${confirmed ? "confirmed" : "inferred"}`}>
    {confirmed ? "✓" : "~"} {label}
  </span>
);

const RiskBadge = ({ level }) => {
  const map = { HIGH: ["risk-high","🔴"], MEDIUM: ["risk-med","🟡"], LOW: ["risk-low","🟢"] };
  const [cls, icon] = map[level] || ["risk-low","🟢"];
  return <span className={`risk-badge ${cls}`}>{icon} {level}</span>;
};

const GongCall = ({ call }) => {
  const typeMap = {
    "Demo": { cls: "type-demo", icon: "🎯" },
    "Meeting Booked": { cls: "type-warm", icon: "📅" },
    "Zoom": { cls: "type-zoom", icon: "🎥" },
    "Zoom Call": { cls: "type-zoom", icon: "🎥" },
    "Email — Inbound": { cls: "type-email-in", icon: "📨" },
    "Email — Outbound": { cls: "type-email-out", icon: "📤" },
    "Email — Exec Escalation": { cls: "type-email-exec", icon: "🚀" },
    "Email — Partner Intelligence": { cls: "type-email-in", icon: "🤝" },
    "Email — Follow Up": { cls: "type-email-out", icon: "📤" },
    "Email — Case Study Sent": { cls: "type-email-out", icon: "📎" },
    "Cold Call — WARM": { cls: "type-warm", icon: "🔥" },
    "Cold Call Connected": { cls: "type-connected", icon: "📞" },
    "Cold Call Blocked": { cls: "type-blocked", icon: "🚫" },
    "Cold Call VM": { cls: "type-vm", icon: "📭" },
    "Cold Call Voicemail": { cls: "type-vm", icon: "📭" },
    "Cold Call — VM": { cls: "type-vm", icon: "📭" },
    "Cold Call — Rejected": { cls: "type-blocked", icon: "❌" },
    "Cold Call — Wrong Person": { cls: "type-vm", icon: "👤" },
    "Internal Prep": { cls: "type-internal", icon: "📋" },
    "Intelligence": { cls: "type-warm", icon: "💡" },
  };
  const { cls, icon } = typeMap[call.type] || { cls: "type-vm", icon: "📞" };
  return (
    <div className="gong-call">
      <div className="gong-call-header">
        <span className={`gong-type-badge ${cls}`}>{icon} {call.type}</span>
        <span className="gong-date">{call.date}</span>
        {call.owner && <span className="gong-owner">by {call.owner}</span>}
        {call.url && <a href={call.url} target="_blank" rel="noopener noreferrer" className="gong-link">▶ Open</a>}
      </div>
      <div className="gong-contact">🧑‍💼 {call.contact}</div>
      <div className="gong-summary">{call.summary}</div>
    </div>
  );
};

const ContactRow = ({ contact }) => (
  <div className="contact-card">
    <div className="contact-name">{contact.name}</div>
    <div className="contact-title">{contact.title}</div>
    {contact.email && <div className="contact-email">✉️ {contact.email}</div>}
    {contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="contact-linkedin">LinkedIn ↗</a>}
    {contact.sdr_note && <div className="contact-sdr-note">💬 {contact.sdr_note}</div>}
    {contact.status && <span className={`contact-status cs-${contact.status.toLowerCase().replace(/\s/g,"-")}`}>{contact.status}</span>}
  </div>
);

const MessageBlock = ({ message }) => (
  <div className="message-block">
    <div className="message-persona">📩 {message.persona}</div>
    <div className="message-subject">Subject: <em>{message.subject}</em></div>
    <div className="message-body">{message.body}</div>
    {message.cta && <div className="message-cta">CTA: {message.cta}</div>}
  </div>
);

export default function AccountDetail({ account, onClose }) {
  const [activeTab, setActiveTab] = useState("intelligence");

  const {
    name, parent, domain, sfdc, priority, vertical, status,
    hq, employees, revenue, last_activity, quick_context, next_step,
    group_structure, financials, tech_stack, key_execs, champions,
    blockers, cc_footprint, regulatory_signals, gong_history,
    use_cases, best_case_study, narrative, outreach_angle,
    ai_initiatives, recent_news, risk_level,
    sdr_playbook,
  } = account;

  const priorityClass = { A: "p-a", B: "p-b", C: "p-c" }[priority];
  const callCount = gong_history?.length || 0;
  const lastCall = gong_history?.length ? [...gong_history].sort((a,b) => b.date.localeCompare(a.date))[0] : null;

  const tabs = [
    { id: "intelligence", label: "🧠 Intelligence" },
    { id: "engagement", label: `📞 Engagement (${callCount})` },
    { id: "sdr", label: "🎯 SDR Playbook" },
    { id: "cresta", label: "🚀 Cresta Fit" },
  ];

  return (
    <div className="detail-view">
      {/* ── HEADER ── */}
      <div className="detail-header">
        <button className="close-btn" onClick={onClose}>← Back to territory</button>
        <div className="detail-title-row">
          <span className={`priority-pill large ${priorityClass}`}>{priority}</span>
          <h1 className="detail-name">{name}</h1>
          {risk_level && <RiskBadge level={risk_level} />}
        </div>
        <div className="detail-badges">
          <span className="vertical-badge">{vertical}</span>
          <span className="status-badge">{status}</span>
          <span className="detail-meta-item">📍 {hq}</span>
          <span className="detail-meta-item">👥 {employees}</span>
          <span className="detail-meta-item">💰 {revenue}</span>
          <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="detail-link">{domain} ↗</a>
          <a href={sfdc} target="_blank" rel="noopener noreferrer" className="detail-link sfdc-link">Salesforce ↗</a>
        </div>
      </div>

      {/* ── ALERT STRIP ── */}
      {lastCall && (
        <div className="alert-strip">
          <div className="alert-item">
            <span className="alert-label">LAST CONTACT</span>
            <span className="alert-value">{lastCall.date} · {lastCall.type} · {lastCall.contact}</span>
          </div>
          <div className="alert-divider"/>
          <div className="alert-item">
            <span className="alert-label">DAYS SINCE CONTACT</span>
            <span className="alert-value alert-days">
              {lastCall.date !== "Unknown" ? Math.floor((new Date() - new Date(lastCall.date)) / 86400000) : "?"} days
            </span>
          </div>
          <div className="alert-divider"/>
          <div className="alert-item next-step-alert">
            <span className="alert-label">NEXT STEP</span>
            <span className="alert-value">{next_step}</span>
          </div>
        </div>
      )}

      {/* ── CALLOUTS ── */}
      <div className="callout-row">
        <div className="next-step-callout">
          <div className="callout-label">🎯 RECOMMENDED NEXT STEP</div>
          <div className="callout-text">{next_step}</div>
        </div>
        <div className="outreach-callout">
          <div className="callout-label">💬 OPENING ANGLE</div>
          <div className="callout-text italic">{outreach_angle}</div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="tab-bar">
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-content">

        {/* ════════════════════════════════════ INTELLIGENCE TAB */}
        {activeTab === "intelligence" && (
          <div className="tab-pane">

            <Section title="Group Structure & Financials" icon="🏢">
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

            <Section title="Tech Stack" icon="💻">
              <div className="tech-legend">
                <span className="tech-badge confirmed">✓ Confirmed source</span>
                <span className="tech-badge inferred">~ Inferred / hypothesis</span>
              </div>
              <div className="tech-section-label confirmed-label">✅ Confirmed</div>
              <div className="tech-grid">
                {(tech_stack?.confirmed || []).map(t => <TechBadge key={t} label={t} confirmed />)}
                {(!tech_stack?.confirmed?.length) && <span className="no-data">No confirmed stack data</span>}
              </div>
              <div className="tech-section-label inferred-label">🔶 Inferred</div>
              <div className="tech-grid">
                {(tech_stack?.inferred || []).map(t => <TechBadge key={t} label={t} confirmed={false} />)}
                {(!tech_stack?.inferred?.length) && <span className="no-data">No inferred data</span>}
              </div>
            </Section>

            {ai_initiatives && (
              <Section title="AI & Contact Centre Initiatives" icon="🤖" accent="blue">
                <div className="initiative-list">
                  {ai_initiatives.map((item, i) => (
                    <div key={i} className="initiative-item">
                      <div className="initiative-title">{item.title}</div>
                      <div className="initiative-detail">{item.detail}</div>
                      {item.source && <div className="initiative-source">Source: {item.source}</div>}
                      {item.cresta_angle && <div className="initiative-cresta">💡 Cresta angle: {item.cresta_angle}</div>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Contact Centre Footprint" icon="📞">
              <p className="detail-text">{cc_footprint}</p>
            </Section>

            <Section title="Regulatory Signals & Fines" icon="⚖️" accent="amber">
              <p className="detail-text regulatory">{regulatory_signals}</p>
            </Section>

            {recent_news && recent_news.length > 0 && (
              <Section title="Recent News & Trigger Events" icon="📰">
                <div className="news-list">
                  {recent_news.map((item, i) => (
                    <div key={i} className="news-item">
                      <div className="news-date">{item.date}</div>
                      <div className="news-headline">{item.headline}</div>
                      <div className="news-detail">{item.detail}</div>
                      {item.cresta_relevance && <div className="news-relevance">🎯 {item.cresta_relevance}</div>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

          </div>
        )}

        {/* ════════════════════════════════════ ENGAGEMENT TAB */}
        {activeTab === "engagement" && (
          <div className="tab-pane">

            <Section title="Key Contacts" icon="👥" defaultOpen={true}>
              {key_execs && key_execs.length > 0 ? (
                <div className="contacts-grid">
                  {key_execs.map((e, i) => <ContactRow key={i} contact={e} />)}
                </div>
              ) : <p className="no-data">No contacts identified yet.</p>}
            </Section>

            <Section title="Champions" icon="⭐" accent="green">
              <p className="detail-text">{champions || "No confirmed champions."}</p>
            </Section>

            <Section title="Blockers & Risks" icon="🚧" accent="red">
              <p className="detail-text blockers">{blockers || "No confirmed blockers."}</p>
            </Section>

            <Section title={`Engagement History (${callCount})`} icon="📋">
              {gong_history && gong_history.length > 0 ? (
                <div className="gong-list">
                  {[...gong_history].sort((a,b) => b.date.localeCompare(a.date)).map((call, i) => (
                    <GongCall key={i} call={call} />
                  ))}
                </div>
              ) : (
                <div className="no-calls">
                  <p>No engagement history logged yet.</p>
                  <p className="no-calls-sub">See the SDR Playbook tab for outreach recommendations.</p>
                </div>
              )}
            </Section>

          </div>
        )}

        {/* ════════════════════════════════════ SDR PLAYBOOK TAB */}
        {activeTab === "sdr" && (
          <div className="tab-pane">
            {sdr_playbook ? (
              <>
                <div className="sdr-header">
                  <div className="sdr-title">SDR Playbook — {name}</div>
                  <div className="sdr-sub">Account hypothesis, target contacts, suggested messaging, and objection handling for outbound</div>
                </div>

                <Section title="Account Hypothesis" icon="🧪" defaultOpen={true} accent="blue">
                  <p className="detail-text hypothesis">{sdr_playbook.hypothesis}</p>
                  <div className="hypothesis-signals">
                    <div className="signals-label">Key buying signals:</div>
                    <ul className="signals-list">
                      {sdr_playbook.buying_signals?.map((s,i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </Section>

                <Section title="Target Contacts — Who to Reach" icon="🎯" defaultOpen={true}>
                  <div className="target-contacts">
                    {sdr_playbook.target_contacts?.map((c, i) => (
                      <div key={i} className="target-contact-card">
                        <div className="tc-priority-row">
                          <span className={`tc-priority tp-${c.priority?.toLowerCase()}`}>{c.priority}</span>
                          <span className="tc-name">{c.name}</span>
                          <span className="tc-title">{c.title}</span>
                        </div>
                        <div className="tc-why"><strong>Why target:</strong> {c.why}</div>
                        <div className="tc-approach"><strong>Approach:</strong> {c.approach}</div>
                        {c.linkedin_search && <div className="tc-linkedin">🔍 LinkedIn search: <em>{c.linkedin_search}</em></div>}
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Suggested Messaging" icon="✉️">
                  <div className="messages-list">
                    {sdr_playbook.messages?.map((m, i) => <MessageBlock key={i} message={m} />)}
                  </div>
                </Section>

                <Section title="Call Talk Track" icon="📞">
                  <div className="talk-track">
                    <div className="tt-opener">
                      <div className="tt-label">OPENER (first 10 seconds)</div>
                      <div className="tt-text">{sdr_playbook.talk_track?.opener}</div>
                    </div>
                    <div className="tt-pitch">
                      <div className="tt-label">VALUE PROPOSITION (20 seconds)</div>
                      <div className="tt-text">{sdr_playbook.talk_track?.pitch}</div>
                    </div>
                    <div className="tt-question">
                      <div className="tt-label">QUALIFYING QUESTION</div>
                      <div className="tt-text">{sdr_playbook.talk_track?.qualifying_question}</div>
                    </div>
                    <div className="tt-ask">
                      <div className="tt-label">THE ASK</div>
                      <div className="tt-text">{sdr_playbook.talk_track?.ask}</div>
                    </div>
                  </div>
                </Section>

                <Section title="Objection Handling" icon="🛡️">
                  <div className="objections-list">
                    {sdr_playbook.objections?.map((o, i) => (
                      <div key={i} className="objection-item">
                        <div className="objection-q">❓ "{o.objection}"</div>
                        <div className="objection-a">✅ {o.response}</div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Sequencing & Cadence" icon="📅">
                  <div className="cadence-list">
                    {sdr_playbook.cadence?.map((step, i) => (
                      <div key={i} className="cadence-step">
                        <div className="cadence-day">Day {step.day}</div>
                        <div className="cadence-action">{step.action}</div>
                        <div className="cadence-note">{step.note}</div>
                      </div>
                    ))}
                  </div>
                </Section>

              </>
            ) : (
              <div className="no-playbook">
                <p>SDR Playbook not yet built for this account.</p>
                <p>Ask Marcus or run "update territory" to generate one.</p>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════ CRESTA FIT TAB */}
        {activeTab === "cresta" && (
          <div className="tab-pane">

            <Section title="Executive Narrative" icon="📖" defaultOpen={true} accent="blue">
              <p className="detail-text narrative">{narrative}</p>
            </Section>

            <Section title="Best-Fit Use Cases" icon="🎯" defaultOpen={true}>
              <ul className="use-case-list">
                {(use_cases || []).map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </Section>

            <Section title="Recommended Case Studies" icon="📚">
              <p className="detail-text case-study">{best_case_study}</p>
            </Section>

            <Section title="Competitive Landscape" icon="⚔️">
              <div className="two-col">
                <div>
                  <h4>Likely Competitors in Evaluation</h4>
                  <p className="detail-text">{account.competitors || "Unknown — discovery needed"}</p>
                </div>
                <div>
                  <h4>Why Cresta Wins Here</h4>
                  <p className="detail-text">{account.why_cresta_wins || "See Executive Narrative above"}</p>
                </div>
              </div>
            </Section>

          </div>
        )}

      </div>
    </div>
  );
}
