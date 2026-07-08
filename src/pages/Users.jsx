import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import BackButton from "../components/BackButton";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../styles/theme";
import {
  getAllUsers, updateUserRole, deleteUser, createUserByAdmin, downloadUsersPdf,
} from "../services/userService";

export default function Users() {
  const [users, setUsers]               = useState([]);
  const [currentUser, setCurrentUser]   = useState(null);
  const [editedRoles, setEditedRoles]   = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError]   = useState("");
  const [createForm, setCreateForm]     = useState({
    fullName: "", email: "", phone: "", address: "", password: "", role: "USER",
  });

  const navigate    = useNavigate();
  const { isDark }  = useTheme();
  const t           = isDark ? darkTheme : lightTheme;

  useEffect(() => { loadCurrentUser(); loadUsers(); }, []);

  const loadCurrentUser = async () => {
    try {
      const res = await getCurrentUser();
      setCurrentUser(res.data);
    } catch {
      navigate("/login");
    }
  };

  const loadUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
      const roles = {};
      res.data.forEach((u) => { roles[u.id] = u.role; });
      setEditedRoles(roles);
    } catch (err) {
      if (err.response?.status === 403) { alert("Access denied"); navigate("/dashboard"); }
    }
  };

  const handleSaveAll = async () => {
    try {
      const changed = users.filter((u) => editedRoles[u.id] !== u.role);
      if (!changed.length) return;
      await Promise.all(changed.map((u) => updateUserRole(u.id, editedRoles[u.id])));
      alert("Roles updated successfully");
      loadUsers();
    } catch { alert("Failed to update roles"); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user and all associated devices?")) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setEditedRoles((prev) => { const next = { ...prev }; delete next[userId]; return next; });
      alert("User deleted successfully");
    } catch { alert("Failed to delete user"); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError("");
    try {
      await createUserByAdmin(createForm);
      alert("User created successfully");
      setCreateForm({ fullName: "", email: "", phone: "", address: "", password: "", role: "USER" });
      setShowCreateForm(false);
      loadUsers();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleDownloadUsersPdf = async () => {
    try {
      await downloadUsersPdf();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to download PDF");
    }
  };

  const isSuperOrDev = ["SUPER_ADMIN", "DEVELOPER"].includes(currentUser?.role);

  const inputStyle = {
    padding: "8px", borderRadius: "4px",
    border: `1px solid ${t.inputBorder}`,
    backgroundColor: t.inputBackground,
    color: t.text, width: "100%", boxSizing: "border-box",
  };

  const selectStyle = { ...inputStyle };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: t.background, padding: "20px" }}>
      <BackButton />

      {/* ── Header ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, color: t.text }}>User List</h2>

        <div style={{ textAlign: "center" }}>
          {currentUser && (
            <>
              <div style={{ color: t.text }}><strong>{currentUser.fullName}</strong></div>
              <div style={{
                display: "inline-block", padding: "4px 10px", marginTop: "4px",
                backgroundColor: t.badgeBackground, color: t.badgeText,
                borderRadius: "20px", fontSize: "12px", fontWeight: "bold",
              }}>
                {currentUser.role}
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: "right", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={() => { localStorage.clear(); navigate("/login"); }}
            style={{ padding: "8px 16px", backgroundColor: t.btnSecondary, color: t.btnSecondaryText, border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>

      {/* ── Create User Button ── */}
      {isSuperOrDev && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "16px" }}>
          <button
            onClick={handleDownloadUsersPdf}
            style={{ padding: "8px 16px", backgroundColor: t.btnSecondary, color: t.btnSecondaryText, border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Download PDF
          </button>
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setCreateError(""); }}
            style={{ padding: "8px 16px", backgroundColor: t.btnPrimary, color: t.btnPrimaryText, border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            {showCreateForm ? "Cancel" : "Create User"}
          </button>
        </div>
      )}

      {/* ── Create User Form ── */}
      {isSuperOrDev && showCreateForm && (
        <div style={{ marginBottom: "20px", padding: "20px", border: `1px solid ${t.surfaceBorder}`, borderRadius: "8px", backgroundColor: t.surface }}>
          <h3 style={{ marginTop: 0, color: t.text }}>Create New User</h3>
          {createError && <p style={{ color: t.errorColor, marginBottom: "10px" }}>{createError}</p>}

          <form onSubmit={handleCreateUser} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { placeholder: "Full Name", key: "fullName", type: "text"     },
              { placeholder: "Email",     key: "email",    type: "email"    },
              { placeholder: "Phone",     key: "phone",    type: "text"     },
              { placeholder: "Address",   key: "address",  type: "text"     },
              { placeholder: "Password",  key: "password", type: "password" },
            ].map(({ placeholder, key, type }) => (
              <input key={key} type={type} placeholder={placeholder}
                value={createForm[key]}
                onChange={(e) => setCreateForm({ ...createForm, [key]: e.target.value })}
                style={inputStyle} required={["fullName","email","password"].includes(key)}
              />
            ))}

            <select value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              style={selectStyle}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="DEVELOPER">DEVELOPER</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>

            <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
              <button type="submit" style={{ padding: "8px 20px", backgroundColor: t.btnPrimary, color: t.btnPrimaryText, border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${t.surfaceBorder}` }}>
          <thead>
            <tr style={{ backgroundColor: t.tableHeader }}>
              {["ID", "Full Name", "Email", "Phone", "Address", "Role"].map((h) => (
                <th key={h} style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text, textAlign: "left" }}>{h}</th>
              ))}
              {isSuperOrDev && <th style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user.id} style={{ backgroundColor: idx % 2 === 0 ? t.background : t.tableRowAlt }}>
                <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text }}>{user.id}</td>
                <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text }}>{user.fullName}</td>
                <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text }}>{user.email}</td>
                <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text }}>{user.phone}</td>
                <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, color: t.text }}>{user.address}</td>
                <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}` }}>
                  {isSuperOrDev ? (
                    <select value={editedRoles[user.id] || user.role}
                      disabled={user.id === currentUser?.id}
                      onChange={(e) => setEditedRoles((prev) => ({ ...prev, [user.id]: e.target.value }))}
                      style={selectStyle}>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="DEVELOPER">DEVELOPER</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  ) : (
                    <span style={{ color: t.text }}>{user.role}</span>
                  )}
                </td>
                {isSuperOrDev && (
                  <td style={{ padding: "10px", border: `1px solid ${t.surfaceBorder}`, textAlign: "center" }}>
                    {user.id !== currentUser?.id && (
                      <button onClick={() => handleDeleteUser(user.id)}
                        style={{ backgroundColor: t.btnDanger, color: t.btnDangerText, border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer" }}>
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Save Changes ── */}
      {isSuperOrDev && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button onClick={handleSaveAll}
            disabled={!users.some((u) => editedRoles[u.id] !== u.role)}
            style={{ padding: "8px 20px", backgroundColor: t.btnPrimary, color: t.btnPrimaryText, border: "none", borderRadius: "4px", cursor: "pointer", opacity: users.some((u) => editedRoles[u.id] !== u.role) ? 1 : 0.5 }}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}