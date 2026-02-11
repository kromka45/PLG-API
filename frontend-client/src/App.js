import { useMemo, useState } from "react";
import "./App.css";

function KeyValueTable({ data }) {
  if (!data || typeof data !== "object") return null;

  const entries = Object.entries(data);

  if (entries.length === 0) {
    return <div>No fields in payload.</div>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>
            Field
          </th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k}>
            <td style={{ verticalAlign: "top", borderBottom: "1px solid #eee", padding: "8px" }}>
              <code>{k}</code>
            </td>
            <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {typeof v === "string" ? v : JSON.stringify(v, null, 2)}
              </pre>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function App() {
  const [backendBaseUrl, setBackendBaseUrl] = useState("http://127.0.0.1:9600");
  const [apiKey, setApiKey] = useState("");
  const [bohemiaId, setBohemiaId] = useState("");
  const [nick, setNick] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  const killerBiId = useMemo(() => bohemiaId.trim(), [bohemiaId]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setResponse(null);

    if (!killerBiId) {
      setError("bohemia_id is required");
      return;
    }
    if (!apiKey.trim()) {
      setError("API key is required (X-API-Key)");
      return;
    }

    setLoading(true);
    try {
      const url = new URL("/api/", backendBaseUrl);
      url.searchParams.set("killer_bi_id", killerBiId);

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-API-Key": apiKey.trim(),
        },
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!res.ok) {
        throw new Error(data?.detail || `Request failed (${res.status})`);
      }

      setResponse(data);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const bigPayload = response?.big_payload;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h2>Player Lookup</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Backend base URL
          <input
            value={backendBaseUrl}
            onChange={(e) => setBackendBaseUrl(e.target.value)}
            placeholder="http://127.0.0.1:9600"
            style={{ width: "100%" }}
          />
        </label>

        <label>
          API Key (X-API-Key)
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="paste API key"
            style={{ width: "100%" }}
          />
        </label>

        <label>
          bohemia_id (sent to backend as killer_bi_id)
          <input
            value={bohemiaId}
            onChange={(e) => setBohemiaId(e.target.value)}
            placeholder="e.g. 12345"
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Nick (optional)
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            placeholder="your nickname"
            style={{ width: "100%" }}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {nick.trim() && (
        <div style={{ marginTop: 16 }}>
          Client nick: <strong>{nick.trim()}</strong>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, color: "crimson" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: 20 }}>
          <h3>Backend response (cached in SQLite)</h3>
          <div style={{ marginBottom: 12 }}>
            <div>
              <strong>killer_bi_id:</strong> {response.killer_bi_id}
            </div>
            <div>
              <strong>synced_at:</strong> {response.synced_at}
            </div>
          </div>

          <h4>big_payload</h4>
          {bigPayload ? (
            <KeyValueTable data={bigPayload} />
          ) : (
            <pre style={{ padding: 16, background: "#f6f8fa", overflow: "auto" }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}