import { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../api";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      const res = await axios.post(`${API_BASE}/login`, form);
      login(res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }

    setSubmitting(false);
  }

  return (
    <div className="main-page">


      <div className="page-body auth-page">
        <form className="professional-form auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">

            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">

            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error ? <span className="form-error">{error}</span> : null}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </div>
          <p className="auth-switch">
            No account yet? <Link to="/register">Register</Link>
          </p>
        </form>


      </div>
    </div>
  );
}

export default LoginPage;