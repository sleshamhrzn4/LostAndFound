import { Link } from "react-router";

function NotFoundPage() {
  return (
    <div className="main-page">
      <div className="empty-state">
        <div className="empty-state-icon">404</div>
        <h3>Page not found</h3>
        <p>That URL doesn&apos;t exist.</p>
        <div className="form-actions" style={{ justifyContent: "center" }}>
          <Link to="/" className="btn btn-primary">Back to reports</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
