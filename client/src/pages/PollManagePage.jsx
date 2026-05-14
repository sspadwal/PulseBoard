import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";

export default function PollManagePage() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [status, setStatus] = useState("draft");

  const load = useCallback(async () => {
    setError("");
    const json = await api(`/api/poll/${pollId}`);
    const p = json.data;
    setPoll(p);
    setTitle(p.title || "");
    setDescription(p.description || "");
    const ex = p.expiresAt ? new Date(p.expiresAt) : new Date();
    ex.setMinutes(ex.getMinutes() - ex.getTimezoneOffset());
    setExpiresAt(ex.toISOString().slice(0, 16));
    setStatus(p.status || "draft");
  }, [pollId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function run(action) {
    setBusy(true);
    setError("");
    try {
      await action();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveMeta() {
    await run(() =>
      api(`/api/poll/${pollId}`, {
        method: "PATCH",
        body: {
          title: title.trim(),
          description: description.trim(),
          expiresAt: new Date(expiresAt).toISOString(),
          status,
        },
      }),
    );
    setEditing(false);
  }

  const shareUrl =
    typeof window !== "undefined" && poll?.shareToken
      ? `${window.location.origin}/p/${poll.shareToken}`
      : "";

  if (!poll && !error) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="page">
        <p className="error">{error}</p>
        <Link to="/app">Back to polls</Link>
      </div>
    );
  }

  const published = poll.status === "published";

  return (
    <div className="page">
      <p>
        <Link to="/app" className="muted">
          ← All polls
        </Link>
      </p>
      <div className="page-head">
        <h1>{poll.title}</h1>
        <span className={`badge badge-${poll.status}`}>{poll.status}</span>
      </div>
      {error ? <p className="error">{error}</p> : null}

      <section className="card pad stack">
        <h2 className="h2">Share</h2>
        <p className="muted small">
          {poll.status === "draft"
            ? "Draft polls are not visible on the public link. Set status to Active to share."
            : "Anyone with this link can open the poll (subject to your anonymity and expiry rules)."}
        </p>
        {poll.status !== "draft" ? (
          <div className="copy-row">
            <input readOnly value={shareUrl} className="mono" />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
            >
              Copy
            </button>
            <Link className="btn btn-ghost" to={`/p/${poll.shareToken}`} target="_blank" rel="noreferrer">
              Open
            </Link>
          </div>
        ) : null}
        <p className="small muted">
          Token: <code>{poll.shareToken}</code>
        </p>
      </section>

      <section className="card pad stack">
        <div className="page-head">
          <h2 className="h2">Details</h2>
          {!published ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => (editing ? setEditing(false) : setEditing(true))}
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          ) : null}
        </div>
        {editing ? (
          <>
            <label className="field">
              <span>Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={1000}
              />
            </label>
            <label className="field">
              <span>Expires</span>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="closed">closed</option>
              </select>
            </label>
            <button className="btn btn-primary" type="button" disabled={busy} onClick={() => saveMeta()}>
              Save changes
            </button>
          </>
        ) : (
          <>
            <p>{poll.description || "—"}</p>
            <p className="muted small">
              Expires {poll.expiresAt ? new Date(poll.expiresAt).toLocaleString() : "—"} ·{" "}
              {poll.isAnonymous ? "Anonymous" : "Signed-in voters only"}
            </p>
          </>
        )}
      </section>

      <section className="card pad stack">
        <h2 className="h2">Actions</h2>
        <div className="btn-row">
          {poll.status === "active" ? (
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() =>
                run(() => api(`/api/poll/${pollId}/close`, { method: "POST" }))
              }
            >
              Close poll
            </button>
          ) : null}
          {["active", "closed"].includes(poll.status) ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() =>
                run(() => api(`/api/poll/${pollId}/publish`, { method: "POST" }))
              }
            >
              Publish results
            </button>
          ) : null}
          <Link className="btn btn-ghost" to={`/app/polls/${pollId}/analytics`}>
            Analytics
          </Link>
        </div>
      </section>
    </div>
  );
}
