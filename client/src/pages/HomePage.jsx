import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./home.css";

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 12v5M12 8v9M17 5v12" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-wrap">
      <section className="home-grid" aria-label="PulseBoard overview">
        <article className="home-tile home-tile--hero">
          <p className="home-kicker">PulseBoard</p>
          <h1 className="home-title">Soft polls. Clear answers.</h1>
          <p className="home-lead">
            Build single-choice surveys, share one link, and lift the lid on results when you are
            ready - all in a calm, tactile interface.
          </p>
          <div className="home-actions">
            {isAuthenticated ? (
              <Link className="btn btn-primary" to="/app/polls/new">
                Create a poll
              </Link>
            ) : (
              <>
                <Link className="btn btn-primary no-hover" to="/register">
                  Get started
                </Link>
                <Link className="btn btn-ghost" to="/login">
                  Log in
                </Link>
              </>
            )}
          </div>
          <div className="home-actions" style={{ marginTop: "1.1rem" }}>
            <span className="home-pill">Draft &amp; active</span>
            <span className="home-pill">Share links</span>
            <span className="home-pill">Analytics</span>
          </div>
        </article>

        <article className="home-tile home-tile--panel">
          <div>
            <p className="home-kicker">Why PulseBoard</p>
            <h2 className="home-panel-title">Feels like hardware, lives in the cloud.</h2>
            <p className="home-panel-copy">
              Mandatory questions, anonymous or signed-in voters, and a simple path from publish →
              collect → close → share results.
            </p>
          </div>
          {isAuthenticated ? (
            <Link className="btn btn-primary" to="/app">
              Open my polls
            </Link>
          ) : (
            <Link className="btn btn-primary no-hover" to="/register">
              Create free account
            </Link>
          )}
        </article>

        <article className="home-tile home-tile--full">
          <div className="home-icon">
            <IconLink />
          </div>
          <div className="home-body">
            <h3>One link, every vote</h3>
            <p>
              Each poll gets a share token. Paste it in chat, email, or slides - respondents tap,
              pick, and submit.
            </p>
          </div>
        </article>

        <article className="home-tile home-tile--stat">
          <div className="home-icon">
            <IconChart />
          </div>
          <div className="home-body">
            <h3>Raised insights</h3>
            <p>Bar summaries per question when you publish - easy to read at a glance.</p>
          </div>
        </article>

        <article className="home-tile home-tile--stat">
          <div className="home-icon">
            <IconShield />
          </div>
          <div className="home-body">
            <h3>Privacy modes</h3>
            <p>Flip between anonymous IP hashing or authenticated one-response-per-user.</p>
          </div>
        </article>

        <article className="home-tile home-tile--stat">
          <div className="home-icon">
            <IconClock />
          </div>
          <div className="home-body">
            <h3>Lifecycle control</h3>
            <p>Draft, activate, close, then publish results when the story is complete.</p>
          </div>
        </article>
      </section>
    </div>
  );
}
