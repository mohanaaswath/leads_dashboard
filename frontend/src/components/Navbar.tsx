import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  darkMode: boolean;
  toggleDark: () => void;
}

export const Navbar = ({ darkMode, toggleDark }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-title">Smart Leads</span>
      </div>
      <div className="user-area">
        <Link className="button button-secondary" to="/request-service">
          Public form
        </Link>
        <Link className="button button-secondary" to="/test-tools">
          Test tools
        </Link>
        <span className="small">
          {user?.name} • <span style={{ fontWeight: 700 }}>{user?.role}</span>
        </span>
        <button
          onClick={toggleDark}
          className="icon-button"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        <button onClick={handleLogout} className="button button-secondary">
          Logout
        </button>
      </div>
    </nav>
  );
};
