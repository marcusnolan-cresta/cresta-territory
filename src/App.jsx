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
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0).map(m => ({
              role: m.role,
              content: m.content
            })),
            { role: "user", content: userMsg }
          ]
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI. Please try again." }]);
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
          <span className="ai-badge">GPT-4 class · {accounts.length} accounts loaded</span>
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
