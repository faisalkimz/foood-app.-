export default function Topbar({ title, searchQuery, onSearch, admin }) {
  const initials = admin?.name?.split(' ').map(w => w[0]).join('').toUpperCase() || 'A';

  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div className="topbar-right">
        <div className="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button className="topbar-icon-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span className="notif-dot"></span>
        </button>
        <div className="admin-avatar" title={admin?.name}>{initials}</div>
      </div>
    </div>
  );
}
