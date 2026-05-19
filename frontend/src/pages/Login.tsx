import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { User } from "../types";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("All fields required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<{ user: User; token: string }>(
        "/auth/login",
        form,
      );
      login(data.user, data.token);
      // After successful login, redirect to the public request submission page
      navigate("/request-service");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid credentials";
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-center">
          <div className="auth-icon">⚡</div>
          <h1 className="auth-title">Smart Leads</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {error && <div className="auth-alert">{error}</div>}

        <div className="auth-form" style={{ marginTop: 18 }}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="field-control"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="field-control"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="button button-primary button-full"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="footer-note">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};
