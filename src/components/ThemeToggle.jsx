import { useTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../styles/theme";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const t = isDark ? darkTheme : lightTheme;

  return (
    <button
      onClick={toggleTheme}
      title="Toggle theme"
      style={{
        padding: "6px 12px",
        borderRadius: "20px",
        border: `1px solid ${t.surfaceBorder}`,
        backgroundColor: t.btnToggle,
        color: t.btnToggleText,
        cursor: "pointer",
        fontSize: "16px",
      }}
    >
      {isDark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}