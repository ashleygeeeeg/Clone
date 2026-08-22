import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_BACKEND_URL || "";

export default function AdminProviders() {
  const [data, setData] = useState({ available: [], configured: [] });
  const [health, setHealth] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    try {
      setError("");
      const [providers, healthResponse] = await Promise.all([
        fetch(`${API}/api/admin/providers`, { headers }),
        fetch(`${API}/api/admin/health`, { headers }),
      ]);
      if (!providers.ok || !healthResponse.ok) throw new Error("Admin access or backend unavailable");
      setData(await providers.json());
      setHealth((await healthResponse.json()).providers || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const save = async (provider, enabled, model) => {
    const response = await fetch(`${API}/api/admin/providers`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ provider, enabled, model: model || null }),
    });
    if (!response.ok) throw new Error("Unable to save provider configuration");
    await load();
  };

  useEffect(() => { load(); }, []);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1>AI Provider Administration</h1>
      <p>Manage enabled providers and inspect backend health.</p>
      {error && <div role="alert">{error}</div>}

      <section>
        <h2>Providers</h2>
        {data.available.map((provider) => {
          const config = data.configured.find((item) => item.provider === provider) || {};
          const status = health.find((item) => item.provider === provider);
          return (
            <div key={provider} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <strong>{provider}</strong>
              <div>Health: {status?.healthy ? "healthy" : "unavailable"}</div>
              <label>
                Model
                <input defaultValue={config.model || ""} id={`model-${provider}`} />
              </label>
              <label style={{ marginLeft: 16 }}>
                <input type="checkbox" defaultChecked={config.enabled !== false} id={`enabled-${provider}`} /> Enabled
              </label>
              <button
                style={{ marginLeft: 16 }}
                onClick={() => save(
                  provider,
                  document.getElementById(`enabled-${provider}`).checked,
                  document.getElementById(`model-${provider}`).value,
                )}
              >Save</button>
            </div>
          );
        })}
      </section>
    </main>
  );
}
