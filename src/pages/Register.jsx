import { useState } from "react";
import { register } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../styles/theme";

export default function Register() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const t = isDark ? darkTheme : lightTheme;

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", address: "", password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
    alert("Registration successful");
    navigate("/login");
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

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
          {[
            { placeholder: "Full Name",  key: "fullName",  type: "text"     },
            { placeholder: "Email",      key: "email",     type: "email"    },
            { placeholder: "Phone",      key: "phone",     type: "text"     },
            { placeholder: "Address",    key: "address",   type: "text"     },
            { placeholder: "Password",   key: "password",  type: "password" },
          ].map(({ placeholder, key, type }) => (
            <input
              key={key}
              type={type}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              style={inputStyle}
              required
            />
          ))}

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
            Register
          </button>
        </form>

        <p style={{ marginTop: "16px", color: t.textSecondary, textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: t.linkColor }}>Login</Link>
        </p>
      </div>
    </div>
  );
}