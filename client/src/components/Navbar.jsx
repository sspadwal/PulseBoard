import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="nav">
      <Link to="/" className="brand">
        PulseBoard
      </Link>
      <nav className="nav-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/app" end>
              My polls
            </NavLink>
            <NavLink to="/app/polls/new">New poll</NavLink>
            <span className="nav-user">{user?.name}</span>
            <button type="button" className="btn btn-ghost" onClick={() => logout()}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
