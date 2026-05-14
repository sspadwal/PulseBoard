import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

function statusBadge(status) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function DashboardPage() {
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await api("/api/poll/mine");
        if (!cancelled) setPolls(Array.isArray(json.data) ? json.data : []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading your polls…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Your polls</h1>
        <Link className="btn btn-primary" to="/app/polls/new">
          New poll
        </Link>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {polls.length === 0 ? (
        <p className="muted">You have not created any polls yet.</p>
      ) : (
        <ul className="card-list">
          {polls.map((p) => (
            <li key={p._id} className="card">
              <div className="card-row">
                <div>
                  <Link to={`/app/polls/${p._id}`} className="card-title">
                    {p.title}
                  </Link>
                  <p className="muted small">{p.description || "No description"}</p>
                </div>
                {statusBadge(p.status)}
              </div>
              <p className="small muted">
                Share: <code>{p.shareToken}</code>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
