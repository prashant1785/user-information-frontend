import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../styles/theme";

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const t = isDark ? darkTheme : lightTheme;

  if (location.pathname === "/dashboard") return null;

  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        padding: "8px 16px",
        backgroundColor: t.btnSecondary,
        color: t.btnSecondaryText,
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginBottom: "16px",
      }}
    >
      ← Back
    </button>
  );
}