import { Link, NavLink } from "react-router";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo1.png";

function NavBar() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <nav className="nav-bar">
      <Link className="nav-brand" to="/">
        <img src={logo} alt="Islington College" className="nav-logo" />
      </Link>

      <div className="nav-links">
        <NavLink to="/my-claims" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          My Claims
        </NavLink>
        {isLoggedIn ? (
          <button type="button" className="nav-link" onClick={logout}>Log out</button>
        ) : (
          <>
            <Link className="nav-link" to="/login">Log in</Link>
            <Link className="nav-link" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;