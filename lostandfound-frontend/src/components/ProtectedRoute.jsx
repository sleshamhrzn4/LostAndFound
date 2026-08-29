/**
 * Step 6 — ask the auth context whether anyone is logged in. If not, redirect to
 * "/login" instead of rendering `children`.
 */
function ProtectedRoute({ children }) {
  return children;
}

export default ProtectedRoute;
