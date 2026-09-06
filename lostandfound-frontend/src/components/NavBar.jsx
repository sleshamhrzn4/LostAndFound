import { Link, NavLink, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo1.png";

function NavBar() {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchSubmit(e) {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchTerm)}`);
  }

  return (
    <>
      <nav className="nav-bar">
        <Link className="nav-brand" to="/" aria-label="Lost and Found home">
          <img src={logo} alt="Islington College" className="nav-logo" />
          <span className="nav-wordmark">Lost &amp; Found</span>
        </Link>

        <div className="nav-links">



          {isLoggedIn && !isAdmin && (
            <NavLink
              to="/my-claims"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              My Claims
            </NavLink>
          )}

          

          {isLoggedIn ? (
            <button type="button" className="nav-link" onClick={logout}>
              Log out
            </button>
          ) : (
            <>
              <Link className="nav-link" to="/login">Log in</Link>
              <Link className="nav-link" to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      <div className="sub-nav">
        <div className="sub-nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? "sub-nav-link active" : "sub-nav-link"}>
            Home
          </NavLink>
          <NavLink to="/resolved" className={({ isActive }) => isActive ? "sub-nav-link active" : "sub-nav-link"}>
            Resolved
          </NavLink>
          {isAdmin && (
            <NavLink to="/claims" className={({ isActive }) => isActive ? "sub-nav-link active" : "sub-nav-link"}>
              Claims
            </NavLink>
          )}
        </div>

        <form className="sub-nav-search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items…"
            aria-label="Search items"
          />
          <button type="submit" aria-label="Search">⌕</button>
        </form>
      </div>
    </>
  );
}

export default NavBar;