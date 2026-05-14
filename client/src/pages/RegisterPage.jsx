import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: "customer",
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page narrow">
      <h1>Register</h1>
      <form className="stack" onSubmit={handleSubmit}>
        {error ? <p className="error">{error}</p> : null}
        <label className="field">
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={50}
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Password (min 8 characters)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="muted">
        You can log in right away after your account is created.
      </p>
      <p className="muted">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
