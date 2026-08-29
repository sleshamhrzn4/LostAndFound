import { Link } from "react-router";

// Written for you. Rendered by the "*" route you add in Step 2.
function NotFoundPage() {
  return (
    <div className="main-page">
      <h1 className="page-title">Page not found</h1>
      <p className="state-message">
        That URL doesn&apos;t exist. <Link to="/">Back to the list</Link>
      </p>
    </div>
  );
}

export default NotFoundPage;
