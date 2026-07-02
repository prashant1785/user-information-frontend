import { useState } from "react";
import { loginWithOtp, verifyOtp, resendOtp } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../styles/theme";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const t = isDark ? darkTheme : lightTheme;

  const [step, setStep]               = useState("login"); // "login" | "otp"
  const [form, setForm]               = useState({ email: "", password: "" });
  const [otpCode, setOtpCode]         = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Step 1 — validate password and send OTP ──
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithOtp(form);
      setStep("otp");
      startResendCooldown();
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 — verify OTP and get tokens ──
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await verifyOtp({ email: form.email, otpCode });
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP with 30s cooldown ──
  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    setError("");
    try {
      await resendOtp(form.email);
      startResendCooldown();
    } catch {
      setError("Failed to resend OTP. Please try again.");
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

  const btnPrimaryStyle = {
    padding: "10px",
    backgroundColor: t.btnPrimary,
    color: t.btnPrimaryText,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
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

        {step === "login" ? (
          <>
            {/* ── Login Step ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, color: t.text }}>Login</h2>
              <ThemeToggle />
            </div>

            {error && (
              <p style={{ color: t.errorColor, marginBottom: "12px" }}>{error}</p>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: "grid", gap: "12px" }}>
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
                disabled={loading}
                style={{
                  ...btnPrimaryStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Sending OTP..." : "Login"}
              </button>
            </form>

            <p style={{ marginTop: "16px", color: t.textSecondary, textAlign: "center" }}>
              Don't have an account?{" "}
              <Link to="/" style={{ color: t.linkColor }}>Register</Link>
            </p>
          </>
        ) : (
          <>
            {/* ── OTP Step ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h2 style={{ margin: 0, color: t.text }}>Verify OTP</h2>
              <ThemeToggle />
            </div>

            <p style={{ color: t.textSecondary, marginBottom: "20px", fontSize: "14px" }}>
              A 6-digit code has been sent to{" "}
              <strong style={{ color: t.text }}>{form.email}</strong>
            </p>

            {error && (
              <p style={{ color: t.errorColor, marginBottom: "12px" }}>{error}</p>
            )}

            <form onSubmit={handleOtpSubmit} style={{ display: "grid", gap: "12px" }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                style={{
                  ...inputStyle,
                  textAlign: "center",
                  letterSpacing: "5px",
                  fontSize: "15px",
                  fontWeight: "bold",
                }}
                maxLength={6}
                required
              />

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                style={{
                  ...btnPrimaryStyle,
                  opacity: loading || otpCode.length !== 6 ? 0.6 : 1,
                  cursor: loading || otpCode.length !== 6 ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
            </form>

            {/* ── Resend + Back ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "16px",
              }}
            >
              <button
                onClick={() => {
                  setStep("login");
                  setOtpCode("");
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: t.textSecondary,
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: 0,
                }}
              >
                ← Back to login
              </button>

              <button
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                style={{
                  background: "none",
                  border: "none",
                  color: resendCooldown > 0 ? t.textSecondary : t.linkColor,
                  cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  padding: 0,
                }}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend OTP"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}