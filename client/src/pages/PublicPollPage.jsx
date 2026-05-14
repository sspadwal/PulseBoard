import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function PublicPollPage() {
  const { shareToken } = useParams();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [selections, setSelections] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await api(`/api/poll/public/${shareToken}`, { auth: false });
        if (!cancelled) setPayload(json.data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shareToken]);

  const needsLogin = useMemo(() => {
    if (!payload?.poll) return false;
    return !payload.poll.isAnonymous && !isAuthenticated;
  }, [payload, isAuthenticated]);

  const questions = payload?.questions || [];
  const flags = payload?.flags;
  const analytics = payload?.analytics;

  function selectOption(questionId, optionId) {
    setSelections((s) => ({ ...s, [questionId]: optionId }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const answers = [];
    for (const q of questions) {
      const selectedOptionId = selections[q._id];
      if (q.isMandatory && !selectedOptionId) {
        setError(`Please answer: ${q.text}`);
        return;
      }
      if (selectedOptionId) {
        answers.push({ questionId: q._id, selectedOptionId });
      }
    }

    setSubmitting(true);
    try {
      await api(
        `/api/responses/${shareToken}`,
        {
          method: "POST",
          body: { answers },
          auth: !payload.poll.isAnonymous,
        },
      );
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !payload) {
    return (
      <div className="page narrow">
        <p className="error">{error}</p>
        <Link to="/">Home</Link>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="page">
        <p className="muted">Loading poll…</p>
      </div>
    );
  }

  const { poll } = payload;

  if (needsLogin) {
    return (
      <div className="page narrow">
        <h1>{poll.title}</h1>
        <p className="muted">This poll requires you to log in before you can vote.</p>
        <Link className="btn btn-primary" to="/login" state={{ from: location }}>
          Log in to continue
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="page narrow">
        <h1>Thank you</h1>
        <p className="muted">Your response has been recorded.</p>
        <Link to="/">Home</Link>
      </div>
    );
  }

  if (flags?.showResults && analytics) {
    const maxCount = Math.max(
      1,
      ...analytics.questions.flatMap((q) => q.optionStats.map((o) => o.count)),
    );
    return (
      <div className="page">
        <h1>{poll.title}</h1>
        {poll.description ? <p className="muted">{poll.description}</p> : null}
        <p className="badge badge-published">Published results</p>
        <p className="muted">Total responses: {analytics.totalResponses}</p>
        <ul className="stack">
          {analytics.questions.map((q) => (
            <li key={String(q.questionId)} className="card pad">
              <h2 className="h2">{q.text}</h2>
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

  if (!flags?.acceptingResponses) {
    return (
      <div className="page narrow">
        <h1>{poll.title}</h1>
        <p className="muted">
          {flags?.expired
            ? "This poll has expired."
            : "This poll is not accepting responses right now."}
        </p>
        <Link to="/">Home</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{poll.title}</h1>
      {poll.description ? <p className="lead muted">{poll.description}</p> : null}
      <p className="small muted">
        Closes {poll.expiresAt ? new Date(poll.expiresAt).toLocaleString() : "—"}
      </p>

      <form className="stack wide" onSubmit={handleSubmit}>
        {error ? <p className="error">{error}</p> : null}
        {questions.map((q) => (
          <fieldset key={q._id} className="fieldset">
            <legend>
              {q.text}
              {q.isMandatory ? <span className="req"> *</span> : null}
            </legend>
            <div className="options-stack">
              {q.options.map((o) => (
                <label key={o._id} className="radio-line">
                  <input
                    type="radio"
                    name={`q-${q._id}`}
                    checked={selections[q._id] === o._id}
                    onChange={() => selectOption(q._id, o._id)}
                  />
                  <span>{o.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit answers"}
        </button>
      </form>
    </div>
  );
}
