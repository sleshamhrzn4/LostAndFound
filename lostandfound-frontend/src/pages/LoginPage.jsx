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
    <div className="main-page auth-page">
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <div className="auth-brand-mark">✦ Lost &amp; Found</div>
          <h1>Welcome back.</h1>
          <p>
            Sign in to manage your claims and help reconnect lost belongings
            with the people they belong to.
          </p>
        </section>

        <section className="auth-content">
          <h2>Sign in</h2>
          <p className="auth-intro">Use your account details to continue.</p>

          <form className="professional-form auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            {error ? <span className="form-error">{error}</span> : null}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </div>

            <p className="auth-switch">
              Don&apos;t have an account? <Link to="/register">Create one</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
