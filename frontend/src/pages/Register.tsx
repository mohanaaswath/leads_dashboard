import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { User, UserRole } from "../types";

export const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales" as UserRole,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("All fields required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<{ user: User; token: string }>(
        "/auth/register",
        form,
      );
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed",
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
          <h1 className="auth-title">Create Account</h1>
        </div>

        {error && <div className="auth-alert">{error}</div>}

        <div className="auth-form" style={{ marginTop: 18 }}>
          {(["name", "email", "password"] as const).map((f) => (
            <input
              key={f}
              type={
                f === "password" ? "password" : f === "email" ? "email" : "text"
              }
              placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
              value={form[f]}
              onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
              className="field-control"
            />
          ))}

          <select
            value={form.role}
            onChange={(e) =>
              setForm((p) => ({ ...p, role: e.target.value as UserRole }))
            }
            className="field-control"
          >
            <option value="sales">Sales User</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="button button-primary button-full"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>

        <p className="footer-note">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
