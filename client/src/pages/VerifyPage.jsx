import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

export default function VerifyPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const trimmed = token.trim();
      await api(`/api/auth/verify-user/${encodeURIComponent(trimmed)}`, {
        auth: false,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page narrow">
      <h1>Verify email</h1>
      <p className="muted">
        Paste the verification token from your email. The server expects the raw token in the
        URL segment (same value shown in the message).
      </p>
      <form className="stack" onSubmit={handleSubmit}>
        {error ? <p className="error">{error}</p> : null}
        <label className="field">
          <span>Verification token</span>
          <textarea
            rows={3}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            placeholder="Paste token"
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Verifying…" : "Verify"}
        </button>
      </form>
      <p className="muted">
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}
