import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { getAuditLogs } from "../services/auditService";
import BackButton from "../components/BackButton";
import { useTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../styles/theme";

const OPERATION_COLORS = {
  INSERT: { backgroundColor: "#d4edda", color: "#155724" },
  UPDATE: { backgroundColor: "#fff3cd", color: "#856404" },
  DELETE: { backgroundColor: "#f8d7da", color: "#721c24" },
  FETCH:  { backgroundColor: "#d1ecf1", color: "#0c5460" },
};

const DEFAULT_FILTERS = {
  searchKey: "", operationFilter: "", usernameFilter: "",
  entityFilter: "", fromDate: "", toDate: "",
  sortColumn: "timestamp", sortWay: "desc", pageNo: 1, pageSize: 10,
};

export default function AuditLogs() {
  const [currentUser, setCurrentUser] = useState(null);
  const [logs, setLogs]               = useState([]);
  const [filters, setFilters]         = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [totalItems, setTotalItems]   = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [loading, setLoading]         = useState(true);

  const navigate   = useNavigate();
  const { isDark } = useTheme();
  const t          = isDark ? darkTheme : lightTheme;

  useEffect(() => { loadCurrentUser(); }, []);
  useEffect(() => { if (currentUser) fetchLogs(appliedFilters); }, [currentUser, appliedFilters]);

  const loadCurrentUser = async () => {
    try {
      const res = await getCurrentUser();
      if (!["SUPER_ADMIN", "DEVELOPER"].includes(res.data.role)) {
        alert("Access denied"); navigate("/dashboard"); return;
      }
      setCurrentUser(res.data);
    } catch { navigate("/login"); }
  };

  const fetchLogs = async (f) => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        searchKey:       f.searchKey       || null,
        operationFilter: f.operationFilter || null,
        usernameFilter:  f.usernameFilter  || null,
        entityFilter:    f.entityFilter    || null,
        fromDate:        f.fromDate        ? f.fromDate + ":00" : null,
        toDate:          f.toDate          ? f.toDate   + ":00" : null,
        sortColumn: f.sortColumn, sortWay: f.sortWay,
        pageNo: f.pageNo, pageSize: f.pageSize,
      });
      setLogs(res.data.auditLogs);
      setTotalItems(res.data.totalItems);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally { setLoading(false); }
  };

  const handleSort = (column) => {
    const next = {
      ...appliedFilters, sortColumn: column,
      sortWay: appliedFilters.sortColumn === column && appliedFilters.sortWay === "desc" ? "asc" : "desc",
      pageNo: 1,
    };
    setAppliedFilters(next); setFilters(next);
  };

  const handlePageChange = (page) => {
    const next = { ...appliedFilters, pageNo: page };
    setAppliedFilters(next); setFilters(next);
  };

  const sortIndicator = (col) => {
    if (appliedFilters.sortColumn !== col) return " ⇅";
    return appliedFilters.sortWay === "asc" ? " ▲" : " ▼";
  };

  const inputStyle = {
    padding: "8px", borderRadius: "4px",
    border: `1px solid ${t.inputBorder}`,
    backgroundColor: t.inputBackground,
    color: t.text, width: "100%", boxSizing: "border-box",
  };

  const thStyle = {
    padding: "10px", border: `1px solid ${t.surfaceBorder}`,
    color: t.text, textAlign: "left", backgroundColor: t.tableHeader,
  };

  const tdStyle = {
    padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text,
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: t.background, padding: "20px" }}>
      <BackButton />

      {/* ── Header ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, color: t.text }}>Audit Logs</h2>
        <div style={{ textAlign: "center" }}>
          {currentUser && (
            <>
              <div style={{ color: t.text }}><strong>{currentUser.fullName}</strong></div>
              <div style={{ display: "inline-block", padding: "4px 10px", marginTop: "4px", backgroundColor: t.badgeBackground, color: t.badgeText, borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                {currentUser.role}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ padding: "16px", border: `1px solid ${t.surfaceBorder}`, borderRadius: "8px", marginBottom: "20px", backgroundColor: t.surface }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "10px" }}>
          <input name="searchKey" placeholder="Search description / entity / user..."
            value={filters.searchKey}
            onChange={(e) => setFilters({ ...filters, searchKey: e.target.value })}
            style={inputStyle} />

          <select name="operationFilter" value={filters.operationFilter}
            onChange={(e) => setFilters({ ...filters, operationFilter: e.target.value })}
            style={inputStyle}>
            <option value="">All Operations</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="FETCH">FETCH</option>
          </select>

          <select name="entityFilter" value={filters.entityFilter}
            onChange={(e) => setFilters({ ...filters, entityFilter: e.target.value })}
            style={inputStyle}>
            <option value="">All Entities</option>
            <option value="User">User</option>
            <option value="Device">Device</option>
          </select>

          <input name="usernameFilter" placeholder="Filter by username (email)..."
            value={filters.usernameFilter}
            onChange={(e) => setFilters({ ...filters, usernameFilter: e.target.value })}
            style={inputStyle} />

          <input name="fromDate" type="datetime-local" value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
            style={inputStyle} />

          <input name="toDate" type="datetime-local" value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
            style={inputStyle} />
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={() => { setFilters(DEFAULT_FILTERS); setAppliedFilters(DEFAULT_FILTERS); }}
            style={{ padding: "8px 16px", borderRadius: "4px", border: `1px solid ${t.inputBorder}`, backgroundColor: t.btnToggle, color: t.btnToggleText, cursor: "pointer" }}>
            Reset
          </button>
          <button onClick={() => setAppliedFilters({ ...filters, pageNo: 1 })}
            style={{ padding: "8px 16px", borderRadius: "4px", border: "none", backgroundColor: t.btnPrimary, color: t.btnPrimaryText, cursor: "pointer" }}>
            Search
          </button>
        </div>
      </div>

      {/* ── Summary ── */}
      <div style={{ marginBottom: "10px", color: t.textSecondary, fontSize: "14px" }}>
        Total records: <strong style={{ color: t.text }}>{totalItems}</strong>
        &nbsp;|&nbsp; Page <strong style={{ color: t.text }}>{appliedFilters.pageNo}</strong> of{" "}
        <strong style={{ color: t.text }}>{totalPages}</strong>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ padding: "20px", color: t.text }}>Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <p style={{ color: t.text }}>No audit logs found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${t.surfaceBorder}` }}>
            <thead>
              <tr>
                {[["timestamp","Timestamp"],["username","Username"],["entityName","Entity"],["operation","Operation"]].map(([col, label]) => (
                  <th key={col} onClick={() => handleSort(col)}
                    style={{ ...thStyle, cursor: "pointer", userSelect: "none" }}>
                    {label}{sortIndicator(col)}
                  </th>
                ))}
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={log.id} style={{ backgroundColor: idx % 2 === 0 ? t.background : t.tableRowAlt }}>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
                  </td>
                  <td style={tdStyle}>{log.username || "-"}</td>
                  <td style={tdStyle}>{log.entityName}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", display: "inline-block", ...(OPERATION_COLORS[log.operation] || {}) }}>
                      {log.operation}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: "12px", color: t.textSecondary }}>{log.action}</td>
                  <td style={tdStyle}>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", maxWidth: "400px", fontSize: "13px", color: t.text }}>
                      {log.description || "-"}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
          {[["«", 1], ["‹", appliedFilters.pageNo - 1]].map(([label, page]) => (
            <button key={label} onClick={() => handlePageChange(page)}
              disabled={appliedFilters.pageNo === 1}
              style={{ padding: "6px 12px", borderRadius: "4px", border: `1px solid ${t.inputBorder}`, backgroundColor: t.btnToggle, color: t.btnToggleText, cursor: "pointer" }}>
              {label}
            </button>
          ))}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - appliedFilters.pageNo) <= 2)
            .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push("..."); acc.push(p); return acc; }, [])
            .map((p, idx) => p === "..." ? (
              <span key={`e-${idx}`} style={{ color: t.text }}>...</span>
            ) : (
              <button key={p} onClick={() => handlePageChange(p)}
                style={{ padding: "6px 12px", borderRadius: "4px", border: `1px solid ${t.inputBorder}`, backgroundColor: p === appliedFilters.pageNo ? t.btnPrimary : t.btnToggle, color: p === appliedFilters.pageNo ? t.btnPrimaryText : t.btnToggleText, fontWeight: p === appliedFilters.pageNo ? "bold" : "normal", cursor: "pointer" }}>
                {p}
              </button>
            ))}

          {[["›", appliedFilters.pageNo + 1], ["»", totalPages]].map(([label, page]) => (
            <button key={label} onClick={() => handlePageChange(page)}
              disabled={appliedFilters.pageNo === totalPages}
              style={{ padding: "6px 12px", borderRadius: "4px", border: `1px solid ${t.inputBorder}`, backgroundColor: t.btnToggle, color: t.btnToggleText, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Page size ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px", marginTop: "12px", fontSize: "14px", color: t.textSecondary }}>
        Rows per page:
        <select value={appliedFilters.pageSize}
          onChange={(e) => { const next = { ...appliedFilters, pageSize: Number(e.target.value), pageNo: 1 }; setAppliedFilters(next); setFilters(next); }}
          style={{ padding: "4px 8px", borderRadius: "4px", border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBackground, color: t.text }}>
          {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}