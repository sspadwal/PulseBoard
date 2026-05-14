import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

const emptyOption = () => ({ text: "", order: 0 });
const emptyQuestion = () => ({
  text: "",
  order: 0,
  isMandatory: true,
  options: [emptyOption(), emptyOption()],
});

function defaultExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function CreatePollPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [status, setStatus] = useState("active");
  const [expiresAt, setExpiresAt] = useState(defaultExpiresAt);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function updateQuestion(i, patch) {
    setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  }

  function updateOption(qi, oi, text) {
    setQuestions((qs) =>
      qs.map((q, j) => {
        if (j !== qi) return q;
        const options = q.options.map((o, k) =>
          k === oi ? { ...o, text } : o,
        );
        return { ...q, options };
      }),
    );
  }

  function addOption(qi) {
    setQuestions((qs) =>
      qs.map((q, j) =>
        j === qi ? { ...q, options: [...q.options, emptyOption()] } : q,
      ),
    );
  }

  function removeOption(qi, oi) {
    setQuestions((qs) =>
      qs.map((q, j) => {
        if (j !== qi) return q;
        if (q.options.length <= 2) return q;
        return {
          ...q,
          options: q.options.filter((_, k) => k !== oi),
        };
      }),
    );
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion()]);
  }

  function removeQuestion(i) {
    setQuestions((qs) => (qs.length <= 1 ? qs : qs.filter((_, j) => j !== i)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      isAnonymous,
      status,
      expiresAt: new Date(expiresAt).toISOString(),
      questions: questions.map((q, qi) => ({
        text: q.text.trim(),
        order: qi,
        isMandatory: q.isMandatory,
        options: q.options.map((o, oi) => ({
          text: o.text.trim(),
          order: oi,
        })),
      })),
    };
    try {
      const json = await api("/api/poll/", { method: "POST", body: payload });
      const id = json.data?._id;
      if (id) navigate(`/app/polls/${id}`);
      else navigate("/app");
    } catch (err) {
      setError(err.message || "Could not create poll");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page">
      <h1>New poll</h1>
      <form className="stack wide" onSubmit={handleSubmit}>
        {error ? <p className="error">{error}</p> : null}
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={150} />
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
        <div className="row">
          <label className="field">
            <span>Expires</span>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Initial status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Draft (hidden from public link)</option>
              <option value="active">Active (shareable)</option>
            </select>
          </label>
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          Anonymous responses (no login required to vote)
        </label>

        <h2 className="h2">Questions</h2>
        {questions.map((q, qi) => (
          <fieldset key={qi} className="fieldset">
            <legend>
              Question {qi + 1}
              {questions.length > 1 ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={() => removeQuestion(qi)}
                >
                  Remove
                </button>
              ) : null}
            </legend>
            <label className="field">
              <span>Question text</span>
              <input
                value={q.text}
                onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                required
                maxLength={500}
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={q.isMandatory}
                onChange={(e) => updateQuestion(qi, { isMandatory: e.target.checked })}
              />
              Mandatory
            </label>
            <div className="options-block">
              <span className="label">Options (min 2)</span>
              {q.options.map((o, oi) => (
                <div key={oi} className="option-row">
                  <input
                    value={o.text}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    required
                    maxLength={200}
                  />
                  {q.options.length > 2 ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => removeOption(qi, oi)}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-small" onClick={() => addOption(qi)}>
                Add option
              </button>
            </div>
          </fieldset>
        ))}
        <button type="button" className="btn btn-ghost" onClick={addQuestion}>
          Add question
        </button>

        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Create poll"}
        </button>
      </form>
    </div>
  );
}
