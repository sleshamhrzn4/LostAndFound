import { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";

import { API_BASE } from "../api";

function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await axios.post(`${API_BASE}/register`, form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }

    setSubmitting(false);
  }

  return (
    <div className="main-page auth-page">
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <div className="auth-brand-mark">✦ Lost &amp; Found</div>
          <h1>Join the community.</h1>
          <p>
            Create an account to make claims and help return lost belongings
            to the people they belong to.
          </p>
        </section>

        <section className="auth-content">
          <h2>Create your account</h2>
          <p className="auth-intro">It only takes a moment to get started.</p>

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
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            {error ? <span className="form-error">{error}</span> : null}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Creating account…" : "Create account"}
              </button>
            </div>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export default RegisterPage;
