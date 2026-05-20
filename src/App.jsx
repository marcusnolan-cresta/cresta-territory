import { useState, useEffect, useRef } from "react";
import accountsData from "./accounts.json";
import AccountCard from "./components/AccountCard";
import AccountDetail from "./components/AccountDetail";
import SummaryBar from "./components/SummaryBar";

const PIN = "cresta26";

// Cresta logo — full lockup for header/pin screen
const CrestaLogo = ({ height = 28, style = {} }) => (
  <img
    src="/cresta-territory/cresta-logo.png"
    alt="Cresta"
    style={{ height, width: 'auto', display: 'block', ...style }}
  />
);

// Cresta icon-only mark (C symbol) for small contexts — SVG trace of the mark
const CrestaIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 C30 10 14 26 14 46 C14 66 30 82 50 82 C60 82 69 78 75 71" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none"/>
    <path d="M50 28 C38 28 28 38 28 50 C28 62 38 72 50 72 C56 72 61 69 65 65" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.7"/>
  </svg>
);

// PIN Lock Screen
function PinScreen({ onUnlock }) {
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === PIN) {
      sessionStorage.setItem("cresta_unlocked", "1");
      onUnlock();
    } else {
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="pin-screen">
      <div className="pin-card">
        <div className="pin-logo">
          <CrestaLogo height={36} />
        </div>
        <div className="pin-title">EMEA Territory Intelligence</div>
        <div className="pin-sub">Marcus Nolan · Enterprise AE</div>
        <form onSubmit={handleSubmit} className={`pin-form ${shake ? "shake" : ""}`}>
          <input
            type="password"
            className="pin-input"
            placeholder="Enter passphrase"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          <button type="submit" className="pin-btn">Unlock →</button>
        </form>
        <button className="pin-hint-btn" onClick={() => setHint(!hint)}>
          {hint ? "Hide hint" : "Need a hint?"}
        </button>
        {hint && <div className="pin-hint">company name + year 🔑</div>}
      </div>
    </div>
  );
}

// AI Assistant Panel
function AIAssistant({ accounts, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi Marcus — ask me anything about your territory. Try: *'Which accounts have Genesys?'* or *'What's the next step on Hastings?'* or *'Summarise all warm signals this week'*" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const systemPrompt = `You are a territory intelligence assistant for Marcus Nolan, Enterprise AE at Cresta.ai selling to EMEA accounts. 

Marcus's territory has ${accounts.length} accounts. Here is the complete territory data:

${JSON.stringify(accounts, null, 2)}

Answer questions about Marcus's accounts concisely and specifically. Reference actual account names, contacts, dates, and Gong call details from the data. 

When asked about next steps, always be specific and challenger-oriented. When asked about case studies, reference the specific ones mapped to each account.

Keep responses concise — 3-5 sentences max unless a detailed breakdown is requested. Use **bold** for emphasis. Always end with a specific recommended action where relevant.`;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      // Answer directly from accounts data without an API call
      const q = userMsg.toLowerCase();

      // Try to answer common questions directly from data
      let reply = "";

      if (q.includes("genesys")) {
        const matches = accounts.filter(a =>
          JSON.stringify(a.tech_stack).toLowerCase().includes("genesys")
        );
        reply = matches.length
          ? `**Accounts with Genesys:** ${matches.map(a => `\n• **${a.name}** (${a.priority}) — ${a.tech_stack?.confirmed?.find(t => t.toLowerCase().includes("genesys")) || "Genesys confirmed"}`).join("")}\n\nGenesys accounts are high-priority targets — Cresta has a native Genesys integration and Woolworths AU (identical stack to Sainsbury's) is the strongest reference.`
          : "No accounts with confirmed Genesys in the current territory data.";
      } else if (q.includes("cold") || q.includes("risk") || q.includes("30 day") || q.includes("contact")) {
        const stale = accounts
          .filter(a => {
            if (!a.last_activity || a.last_activity === "Unknown") return true;
            const days = Math.floor((new Date() - new Date(a.last_activity)) / 86400000);
            return days > 30;
          })
          .sort((a, b) => (a.last_activity || "").localeCompare(b.last_activity || ""));
        reply = stale.length
          ? `**Accounts with no contact in 30+ days:**\n${stale.map(a => {
              const days = a.last_activity && a.last_activity !== "Unknown"
                ? Math.floor((new Date() - new Date(a.last_activity)) / 86400000)
                : "unknown";
              return `• **${a.name}** (${a.priority}) — last contact ${a.last_activity || "unknown"} (${days}d ago). Next step: ${a.next_step}`;
            }).join("\n")}`
          : "All accounts have been contacted within 30 days.";
      } else if (q.includes("warm signal") || q.includes("this week") || q.includes("recent")) {
        const warm = accounts.filter(a =>
          (a.gong_history || []).some(h =>
            h.type?.includes("WARM") || h.type?.includes("Inbound") || h.type === "Demo" || h.type === "Meeting Booked"
          ) && a.last_activity >= "2026-05-01"
        );
        reply = warm.length
          ? `**Recent warm signals:**\n${warm.map(a => {
              const latest = [...(a.gong_history || [])].sort((x,y) => y.date.localeCompare(x.date))[0];
              return `• **${a.name}** — ${latest?.date}: ${latest?.type} · ${latest?.summary?.slice(0,100)}...`;
            }).join("\n")}`
          : "No recent warm signals found in the last 30 days.";
      } else if (q.includes("next step") || q.includes("priority") || q.includes("urgent")) {
        const urgent = accounts
          .filter(a => (a.open_actions || []).some(x => x.priority === "URGENT" || x.priority === "HIGH"))
          .slice(0, 6);
        reply = `**Top priority actions across territory:**\n${urgent.map(a => {
          const top = (a.open_actions || []).find(x => x.priority === "URGENT" || x.priority === "HIGH");
          return `• **${a.name}** (${a.priority}): ${top?.action}`;
        }).join("\n")}`;
      } else if (q.includes("demo")) {
        const demos = accounts.filter(a => a.deal_stage?.includes("Demo") || a.status?.includes("Active"));
        reply = `**Accounts with demos done or booked:**\n${demos.map(a => `• **${a.name}** (${a.priority}) — Stage: ${a.deal_stage} · ${a.next_step}`).join("\n")}`;
      } else if (q.includes("stall") || q.includes("block") || q.includes("stuck")) {
        const stalled = accounts.filter(a => a.deal_stage === "Stalled" || a.deal_stage === "Closing Out");
        reply = stalled.length
          ? `**Stalled or closing accounts:**\n${stalled.map(a => `• **${a.name}** — ${a.deal_stage}: ${a.blockers?.slice(0,120)}`).join("\n")}`
          : "No accounts currently flagged as stalled.";
      } else if (q.includes("fca") || q.includes("consumer duty") || q.includes("regulatory")) {
        const reg = accounts.filter(a => a.regulatory_signals?.toLowerCase().includes("fca") || a.vertical === "Financial Services");
        reply = `**FCA / Consumer Duty regulated accounts:**\n${reg.map(a => `• **${a.name}** (${a.priority}) — ${a.regulatory_signals?.slice(0,150)}...`).join("\n")}`;
      } else {
        // Generic: search account names and return context
        const nameMatch = accounts.find(a => a.name.toLowerCase().includes(q) || q.includes(a.name.toLowerCase().split(" ")[0]));
        if (nameMatch) {
          reply = `**${nameMatch.name}** (${nameMatch.priority}-priority · ${nameMatch.deal_stage})\n\n${nameMatch.quick_context}\n\n**Next step:** ${nameMatch.next_step}\n\n**Champions:** ${nameMatch.champions || "None confirmed"}\n\n**Blockers:** ${nameMatch.blockers || "None confirmed"}\n\n**Last contact:** ${nameMatch.last_activity}`;
        } else {
          reply = `I searched your territory data for "${userMsg}" but couldn't find a specific match. Try asking:\n• "Which accounts have Genesys?"\n• "Which accounts are going cold?"\n• "What are the urgent actions this week?"\n• "Tell me about Sainsbury's"\n• "Which accounts have demos booked?"`;
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatMsg = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const suggestions = [
    "Which accounts are most at risk of going cold?",
    "Which A-priority accounts have had no contact in 30+ days?",
    "Summarise all warm signals this week",
    "Which accounts have Genesys?",
    "Draft a follow-up email to Kieran at Sainsbury's",
    "What's blocking Hastings Direct?"
  ];

  return (
    <div className="ai-panel">
      <div className="ai-header">
        <div className="ai-header-left">
          <CrestaIcon size={20} />
          <span className="ai-title">Territory AI</span>
          <span className="ai-badge">Live territory data · {accounts.length} accounts</span>
        </div>
        <button className="ai-close" onClick={onClose}>✕</button>
      </div>

      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ai-msg-${m.role}`}>
            <div className="ai-msg-label">{m.role === "user" ? "You" : "Cresta AI"}</div>
            <div
              className="ai-msg-content"
              dangerouslySetInnerHTML={{ __html: formatMsg(m.content) }}
            />
          </div>
        ))}
        {loading && (
          <div className="ai-msg ai-msg-assistant">
            <div className="ai-msg-label">Cresta AI</div>
            <div className="ai-typing"><span/><span/><span/></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="ai-suggestions">
          {suggestions.map((s, i) => (
            <button key={i} className="ai-suggestion" onClick={() => { setInput(s); }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="ai-input-row">
        <textarea
          className="ai-input"
          placeholder="Ask anything about your territory…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button className="ai-send" onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? "…" : "↑"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("cresta_unlocked") === "1"
  );
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterVertical, setFilterVertical] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("priority");
  const [showAI, setShowAI] = useState(false);

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;

  const { meta, accounts } = accountsData;

  const verticals = ["All", ...new Set(accounts.map(a => a.vertical))];
  const statuses = ["All", ...new Set(accounts.map(a => a.status))];

  const filtered = accounts
    .filter(a => {
      if (filterPriority !== "All" && a.priority !== filterPriority) return false;
      if (filterVertical !== "All" && a.vertical !== filterVertical) return false;
      if (filterStatus !== "All" && a.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.quick_context?.toLowerCase().includes(q) ||
          a.hq?.toLowerCase().includes(q) ||
          a.champions?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const po = { A: 0, B: 1, C: 2 };
        return (po[a.priority] ?? 3) - (po[b.priority] ?? 3);
      }
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "activity") {
        const da = a.last_activity || "0";
        const db = b.last_activity || "0";
        return db.localeCompare(da);
      }
      return 0;
    });

  const selected = accounts.find(a => a.id === selectedId);

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <CrestaLogo height={28} />
            <div className="header-sub">EMEA Territory Intelligence · Marcus Nolan</div>
          </div>
          <div className="header-actions">
            <span className="header-date">Updated {meta.last_updated}</span>
            <button className={`ai-toggle-btn ${showAI ? "active" : ""}`} onClick={() => setShowAI(!showAI)}>
              <span className="ai-toggle-icon">✦</span>
              {showAI ? "Close AI" : "Territory AI"}
            </button>
          </div>
        </div>
      </header>

      <SummaryBar accounts={accounts} meta={meta} />

      <div className="main-layout">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="filters">
            <input
              className="search-input"
              placeholder="Search accounts, contacts, context…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="filter-row">
              <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="All">All priorities</option>
                <option value="A">A — Priority</option>
                <option value="B">B — Active</option>
                <option value="C">C — Watch</option>
              </select>
              <select className="filter-select" value={filterVertical} onChange={e => setFilterVertical(e.target.value)}>
                {verticals.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="filter-row">
              <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="priority">Sort: Priority</option>
                <option value="activity">Sort: Recent</option>
                <option value="name">Sort: A–Z</option>
              </select>
            </div>
            <div className="results-count">{filtered.length} accounts</div>
          </div>
          <div className="account-list">
            {filtered.map(a => (
              <AccountCard
                key={a.id}
                account={a}
                selected={a.id === selectedId}
                onClick={() => setSelectedId(a.id === selectedId ? null : a.id)}
              />
            ))}
          </div>
        </div>

        {/* DETAIL PANEL */}
        <div className="detail-panel">
          {selected ? (
            <AccountDetail account={selected} onClose={() => setSelectedId(null)} />
          ) : (
            <div className="empty-state">
              <CrestaLogo height={48} style={{ opacity: 0.4 }} />
              <div className="empty-title">Select an account</div>
              <div className="empty-sub">
                {accounts.length} accounts · {meta.priority_counts?.A} priority A · Last updated {meta.last_updated}
              </div>
              {!showAI && (
                <button className="empty-ai-btn" onClick={() => setShowAI(true)}>
                  ✦ Ask Territory AI
                </button>
              )}
            </div>
          )}
        </div>

        {/* AI PANEL */}
        {showAI && (
          <AIAssistant
            accounts={accounts}
            onClose={() => setShowAI(false)}
          />
        )}
      </div>
    </div>
  );
}
