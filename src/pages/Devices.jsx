import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDevices, addDevice, deleteDevice, downloadDevicesPdf } from "../services/deviceService";
import { getCurrentUser } from "../services/authService";
import BackButton from "../components/BackButton";
import { useTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../styles/theme";

export default function Devices() {
  const [devices, setDevices]         = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm]               = useState({
    deviceId: "", eventType: "ACTIVE", startTime: "", endTime: "", details: "", userId: "",
  });

  const navigate   = useNavigate();
  const { isDark } = useTheme();
  const t          = isDark ? darkTheme : lightTheme;

  useEffect(() => { loadCurrentUser(); }, []);

  const loadCurrentUser = async () => {
    try {
      const res = await getCurrentUser();
      setCurrentUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      await loadDevices(res.data.role);
    } catch { navigate("/login"); }
  };

  const loadDevices = async (role) => {
    try {
      const res = await getDevices(role);
      setDevices(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally { setLoading(false); }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      await addDevice(form);
      alert("Device added successfully");
      setForm({ deviceId: "", eventType: "ACTIVE", startTime: "", endTime: "", details: "", userId: "" });
      setShowAddForm(false);
      await loadDevices(currentUser.role);
    } catch (err) {
      if (err.response?.status === 401) { navigate("/login"); return; }
      alert("Failed to add device");
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    try {
      await deleteDevice(deviceId);
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      alert("Device deleted successfully");
    } catch { alert("Failed to delete device"); }
  };

  const handleDownloadDevicesPdf = async () => {
    try {
      await downloadDevicesPdf();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to download PDF");
    }
  };

  const formatDetails = (details) => {
    try { return JSON.stringify(JSON.parse(details), null, 2); }
    catch { return details; }
  };

  const getEventTypeBadge = (type) => {
    const styles = {
      ACTIVE:            { backgroundColor: "#198754", color: "white" },
      DEACTIVE:          { backgroundColor: "#ffc107", color: "black" },
      SUBSCRIPTION_ENDED:{ backgroundColor: "#dc3545", color: "white" },
    };
    return styles[type] || { backgroundColor: "blue", color: "white" };
  };

  const canManage = ["SUPER_ADMIN", "DEVELOPER"].includes(currentUser?.role);

  const inputStyle = {
    padding: "8px", borderRadius: "4px",
    border: `1px solid ${t.inputBorder}`,
    backgroundColor: t.inputBackground,
    color: t.text, width: "100%", boxSizing: "border-box",
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: t.background, padding: "20px", color: t.text }}>
      Loading devices...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: t.background, padding: "20px" }}>
      <BackButton />

      {/* ── Header ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, color: t.text }}>Devices</h2>

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

      {/* ── Add Device Button ── */}
      {canManage && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "16px" }}>
          <button onClick={handleDownloadDevicesPdf}
            style={{ padding: "8px 16px", backgroundColor: t.btnSecondary, color: t.btnSecondaryText, border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Download PDF
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)}
            style={{ padding: "8px 16px", backgroundColor: t.btnPrimary, color: t.btnPrimaryText, border: "none", borderRadius: "4px", cursor: "pointer" }}>
            {showAddForm ? "Cancel" : "Add Device"}
          </button>
        </div>
      )}

      {/* ── Add Device Form ── */}
      {canManage && showAddForm && (
        <div style={{ marginBottom: "20px", padding: "20px", border: `1px solid ${t.surfaceBorder}`, borderRadius: "8px", backgroundColor: t.surface }}>
          <h3 style={{ marginTop: 0, color: t.text }}>Add Device</h3>
          <form onSubmit={handleAddDevice} style={{ display: "grid", gap: "10px" }}>
            <input type="text" placeholder="Device ID" value={form.deviceId}
              onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
              style={inputStyle} required />

            <input type="number" placeholder="User ID" value={form.userId}
              onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}
              style={inputStyle} required />

            <select value={form.eventType}
              onChange={(e) => setForm({ ...form, eventType: e.target.value })}
              style={inputStyle}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DEACTIVE">DEACTIVE</option>
              <option value="SUBSCRIPTION_ENDED">SUBSCRIPTION_ENDED</option>
            </select>

            <input type="datetime-local" value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              style={inputStyle} required />

            <input type="datetime-local" value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              style={inputStyle} required />

            <textarea rows="5" placeholder='{"channel":"Discovery","watchDuration":120}'
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              style={{ ...inputStyle, resize: "vertical" }} required />

            <div style={{ textAlign: "right" }}>
              <button type="submit"
                style={{ padding: "8px 20px", backgroundColor: t.btnPrimary, color: t.btnPrimaryText, border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Save Device
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ── */}
      {devices.length === 0 ? (
        <p style={{ color: t.text }}>No devices found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${t.surfaceBorder}` }}>
            <thead>
              <tr style={{ backgroundColor: t.tableHeader }}>
                {["Device ID", ...(canManage ? ["User", "Email"] : []), "Event Type", "Start Time", "End Time", "Details", ...(canManage ? ["Actions"] : [])].map((h) => (
                  <th key={h} style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text, textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map((device, idx) => (
                <tr key={device.id} style={{ backgroundColor: idx % 2 === 0 ? t.background : t.tableRowAlt }}>
                  <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text }}>{device.deviceId}</td>
                  {canManage && (
                    <>
                      <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text }}>{device.userName}</td>
                      <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text }}>{device.userEmail}</td>
                    </>
                  )}
                  <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}` }}>
                    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", display: "inline-block", ...getEventTypeBadge(device.eventType) }}>
                      {device.eventType}
                    </span>
                  </td>
                  <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text, whiteSpace: "nowrap" }}>
                    {device.startTime ? new Date(device.startTime).toLocaleString() : "-"}
                  </td>
                  <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text, whiteSpace: "nowrap" }}>
                    {device.endTime ? new Date(device.endTime).toLocaleString() : "-"}
                  </td>
                  <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}` }}>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", maxWidth: "300px", overflowX: "auto", color: t.text, fontSize: "13px" }}>
                      {formatDetails(device.details)}
                    </pre>
                  </td>
                  {canManage && (
                    <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, textAlign: "center" }}>
                      <button onClick={() => handleDeleteDevice(device.id)}
                        style={{ backgroundColor: t.btnDanger, color: t.btnDangerText, border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer" }}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}