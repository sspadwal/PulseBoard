import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";

export default function AnalyticsPage() {
  const { pollId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await api(`/api/poll/${pollId}/analytics`);
        if (!cancelled) setData(json.data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pollId]);

  if (error) {
    return (
      <div className="page">
        <p className="error">{error}</p>
        <Link to={`/app/polls/${pollId}`}>Back to poll</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page">
        <p className="muted">Loading analytics…</p>
      </div>
    );
  }

  const { poll, analytics } = data;
  const maxCount = Math.max(
    1,
    ...analytics.questions.flatMap((q) => q.optionStats.map((o) => o.count)),
  );

  return (
    <div className="page">
      <p>
        <Link to={`/app/polls/${pollId}`} className="muted">
          ← {poll.title}
        </Link>
      </p>
      <h1>Analytics</h1>
      <p className="muted">
        Total responses: <strong>{analytics.totalResponses}</strong>
      </p>

      <ul className="stack">
        {analytics.questions.map((q) => (
          <li key={String(q.questionId)} className="card pad">
            <h2 className="h2">{q.text}</h2>
            <p className="small muted">Answered: {q.answeredCount}</p>
            <ul className="bar-list">
              {q.optionStats.map((o) => (
                <li key={String(o.optionId)} className="bar-item">
                  <div className="bar-label">
                    <span>{o.text}</span>
                    <span className="muted">{o.count}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(o.count / maxCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
