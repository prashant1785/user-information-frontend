import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../styles/theme";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const t = isDark ? darkTheme : lightTheme;

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const response = await login(form);
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Please enter valid login and password.");
      }
    }
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "4px",
    border: `1px solid ${t.inputBorder}`,
    backgroundColor: t.inputBackground,
    color: t.text,
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: t.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "32px",
          backgroundColor: t.surface,
          border: `1px solid ${t.surfaceBorder}`,
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, color: t.text }}>Login</h2>
          <ThemeToggle />
        </div>

        {error && (
          <p style={{ color: t.errorColor, marginBottom: "12px" }}>{error}</p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={inputStyle}
            required
          />
          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: t.btnPrimary,
              color: t.btnPrimaryText,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Login
          </button>
        </form>

        <p style={{ marginTop: "16px", color: t.textSecondary, textAlign: "center" }}>
          Don't have an account?{" "}
          <Link to="/" style={{ color: t.linkColor }}>Register</Link>
        </p>
      </div>
    </div>
  );
}