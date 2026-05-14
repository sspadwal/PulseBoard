import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page hero">
      <h1>Create polls people actually answer</h1>
      <p className="lead muted">
        Build single-choice questions, share a link, and review results when you are ready.
      </p>
      <div className="hero-actions">
        {isAuthenticated ? (
          <Link className="btn btn-primary" to="/app/polls/new">
            Create a poll
          </Link>
        ) : (
          <>
            <Link className="btn btn-primary" to="/register">
              Get started
            </Link>
            <Link className="btn btn-ghost" to="/login">
              Log in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
