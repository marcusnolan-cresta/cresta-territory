const PRIORITY_LABELS = { A: "Top Priority", B: "Good Fit", C: "Monitor" };
const STATUS_COLORS = {
  "Active Opp": "#1E7F45",
  "Target": "#1E6FBF",
  "Active / Deck Delivered": "#1E6FBF",
  "Target / Content Engaged": "#C9A84C",
  "Unknown": "#666",
};

export default function AccountCard({ account, isSelected, onClick }) {
  const { name, priority, vertical, status, last_activity, quick_context, gong_history } = account;
  const callCount = gong_history?.length || 0;
  const hasActive = status === "Active Opp" || status === "Active / Deck Delivered";

  return (
    <div className={`account-card${isSelected ? " selected" : ""}`} onClick={onClick}>
      <div className="card-top">
        <div className="card-name-row">
          <span className={`priority-pill p-${priority.toLowerCase()}`}>{priority}</span>
          <span className="card-name">{name}</span>
          {hasActive && <span className="active-dot" title="Active opportunity"/>}
        </div>
        <div className="card-meta-row">
          <span className="card-vertical">{vertical}</span>
          <span className="card-status" style={{ color: STATUS_COLORS[status] || "#888" }}>{status}</span>
        </div>
      </div>
      <p className="card-context">{quick_context.slice(0, 110)}{quick_context.length > 110 ? "…" : ""}</p>
      <div className="card-footer">
        <span className="card-calls">
          {callCount > 0 ? `${callCount} Gong call${callCount > 1 ? "s" : ""}` : "No calls logged"}
        </span>
        <span className="card-date">
          {last_activity && last_activity !== "Unknown" ? last_activity : "No activity"}
        </span>
      </div>
    </div>
  );
}
