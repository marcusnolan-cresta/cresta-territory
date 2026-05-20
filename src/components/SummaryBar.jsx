export default function SummaryBar({ meta, accounts }) {
  const activeOpps = accounts.filter(a => a.status === "Active Opp").length;
  const recentActivity = accounts.filter(a => {
    if (!a.last_activity || a.last_activity === "Unknown") return false;
    const d = new Date(a.last_activity);
    const now = new Date();
    return (now - d) / (1000 * 60 * 60 * 24) <= 30;
  }).length;

  return (
    <div className="summary-bar">
      <div className="summary-stat">
        <span className="stat-badge a">A</span>
        <span className="stat-value">{meta.priority_counts.A}</span>
        <span className="stat-label">A Priority</span>
      </div>
      <div className="summary-divider"/>
      <div className="summary-stat">
        <span className="stat-badge b">B</span>
        <span className="stat-value">{meta.priority_counts.B}</span>
        <span className="stat-label">B Priority</span>
      </div>
      <div className="summary-divider"/>
      <div className="summary-stat">
        <span className="stat-badge c">C</span>
        <span className="stat-value">{meta.priority_counts.C}</span>
        <span className="stat-label">C Priority</span>
      </div>
      <div className="summary-divider"/>
      <div className="summary-stat">
        <span className="stat-value accent">{activeOpps}</span>
        <span className="stat-label">Active Opps</span>
      </div>
      <div className="summary-divider"/>
      <div className="summary-stat">
        <span className="stat-value accent">{recentActivity}</span>
        <span className="stat-label">Active 30d</span>
      </div>
    </div>
  );
}
