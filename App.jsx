import { useState, useMemo } from "react";
import accountsData from "./accounts.json";
import AccountCard from "./components/AccountCard";
import AccountDetail from "./components/AccountDetail";
import SummaryBar from "./components/SummaryBar";

export default function App() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterVertical, setFilterVertical] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("priority");

  const { accounts, meta } = accountsData;

  const verticals = ["ALL", ...new Set(accounts.map(a => a.vertical))];
  const statuses = ["ALL", ...new Set(accounts.map(a => a.status))];

  const filtered = useMemo(() => {
    let list = accounts.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.name.toLowerCase().includes(q) ||
        a.vertical.toLowerCase().includes(q) ||
        a.quick_context.toLowerCase().includes(q) ||
        (a.key_execs || []).some(e => e.name.toLowerCase().includes(q));
      const matchP = filterPriority === "ALL" || a.priority === filterPriority;
      const matchV = filterVertical === "ALL" || a.vertical === filterVertical;
      const matchS = filterStatus === "ALL" || a.status === filterStatus;
      return matchSearch && matchP && matchV && matchS;
    });

    if (sortBy === "priority") {
      const order = { A: 0, B: 1, C: 2 };
      list = [...list].sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "activity") {
      list = [...list].sort((a, b) => {
        if (!a.last_activity || a.last_activity === "Unknown") return 1;
        if (!b.last_activity || b.last_activity === "Unknown") return -1;
        return new Date(b.last_activity) - new Date(a.last_activity);
      });
    }
    return list;
  }, [accounts, search, filterPriority, filterVertical, filterStatus, sortBy]);

  const selectedAccount = selected ? accounts.find(a => a.id === selected) : null;

  return (
    <div className="app">
      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="header-logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="#C9A84C" strokeWidth="1.5"/>
                <path d="M8 14 Q14 6 20 14 Q14 22 8 14Z" fill="#C9A84C" opacity="0.8"/>
              </svg>
            </div>
            <div>
              <div className="header-title">CRESTA EMEA</div>
              <div className="header-sub">Marcus Nolan · Territory Intelligence</div>
            </div>
          </div>
          <div className="header-meta">
            <span className="header-badge">Last updated: {meta.last_updated}</span>
            <span className="header-badge">{meta.total_accounts} accounts</span>
          </div>
        </div>
      </header>

      {/* ── SUMMARY BAR ── */}
      <SummaryBar meta={meta} accounts={accounts} />

      {/* ── MAIN LAYOUT ── */}
      <div className="main-layout">

        {/* ── SIDEBAR / LIST ── */}
        <aside className="sidebar">
          {/* filters */}
          <div className="filters">
            <input
              className="search-input"
              placeholder="Search accounts, executives, verticals…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="filter-row">
              <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="ALL">All Priorities</option>
                <option value="A">A — Top Priority</option>
                <option value="B">B — Good Fit</option>
                <option value="C">C — Monitor</option>
              </select>
              <select className="filter-select" value={filterVertical} onChange={e => setFilterVertical(e.target.value)}>
                {verticals.map(v => <option key={v} value={v}>{v === "ALL" ? "All Verticals" : v}</option>)}
              </select>
            </div>
            <div className="filter-row">
              <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                {statuses.map(s => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s}</option>)}
              </select>
              <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="priority">Sort: Priority</option>
                <option value="name">Sort: Name A-Z</option>
                <option value="activity">Sort: Recent Activity</option>
              </select>
            </div>
            <div className="results-count">{filtered.length} account{filtered.length !== 1 ? "s" : ""}</div>
          </div>

          {/* account list */}
          <div className="account-list">
            {filtered.map(acc => (
              <AccountCard
                key={acc.id}
                account={acc}
                isSelected={selected === acc.id}
                onClick={() => setSelected(selected === acc.id ? null : acc.id)}
              />
            ))}
          </div>
        </aside>

        {/* ── DETAIL PANEL ── */}
        <main className="detail-panel">
          {selectedAccount ? (
            <AccountDetail account={selectedAccount} onClose={() => setSelected(null)} />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="#C9A84C" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
                  <path d="M16 24 Q24 12 32 24 Q24 36 16 24Z" fill="#C9A84C" opacity="0.2"/>
                </svg>
              </div>
              <p className="empty-title">Select an account</p>
              <p className="empty-sub">Click any account on the left to view full intelligence, Gong history, and Cresta positioning.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
