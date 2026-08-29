import { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";

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
      await axios.post("http://localhost:5000/api/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
              placeholder="you@example.com"
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
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </div>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>


      </div>
    </div>
  );
}

export default RegisterPage;