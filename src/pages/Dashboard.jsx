import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../styles/theme";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const t = isDark ? darkTheme : lightTheme;

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch {
      navigate("/login");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: t.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
      }}
    >
      {/* ── Top-right controls ── */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <ThemeToggle />
        <button
          onClick={logout}
          style={{
            padding: "8px 16px",
            backgroundColor: t.btnSecondary,
            color: t.btnSecondaryText,
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* ── Center card ── */}
      {user && (
        <div
          style={{
            padding: "40px",
            backgroundColor: t.surface,
            border: `1px solid ${t.surfaceBorder}`,
            borderRadius: "12px",
            width: "100%",
            maxWidth: "480px",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: "0 0 24px 0", color: t.text }}>Dashboard</h2>

          <div style={{ display: "grid", gap: "12px", marginBottom: "28px" }}>
            {[
              ["Name",    user.fullName],
              ["Email",   user.email],
              ["Phone",   user.phone],
              ["Address", user.address],
            ].map(([label, value]) => (
              <div key={label} style={{ color: t.text }}>
                <span style={{ color: t.textSecondary }}>{label}: </span>
                <strong>{value}</strong>
              </div>
            ))}

            <div>
              <span style={{ color: t.textSecondary }}>Role: </span>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  backgroundColor: t.badgeBackground,
                  color: t.badgeText,
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {user.role}
              </span>
            </div>
          </div>

          {/* ── Nav buttons ── */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {["ADMIN", "SUPER_ADMIN", "DEVELOPER"].includes(user.role) && (
              <Link to="/users">
                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: t.btnPrimary,
                    color: t.btnPrimaryText,
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  View All Users
                </button>
              </Link>
            )}

            <Link to="/devices">
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: t.btnPrimary,
                  color: t.btnPrimaryText,
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                View Devices
              </button>
            </Link>

            {["SUPER_ADMIN", "DEVELOPER"].includes(user.role) && (
              <Link to="/audit">
                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: t.btnPrimary,
                    color: t.btnPrimaryText,
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Audit Logs
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}