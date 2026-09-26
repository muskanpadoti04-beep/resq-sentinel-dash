import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getRescueActions } from "@/lib/rescue-ai.functions";
import type { RescuePlan } from "@/lib/rescue-ai.server";

type Occ = { id: string; name: string; room: string; status: string; mobility: string };

export function AiCommand({ occupants, context }: { occupants: Occ[]; context: string }) {
  const run = useServerFn(getRescueActions);
  const [updates, setUpdates] = useState("");
  const [log, setLog] = useState<{ time: string; text: string }[]>([]);
  const [conditions, setConditions] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [plan, setPlan] = useState<RescuePlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addUpdate = () => {
    if (!updates.trim()) return;
    setLog((l) => [{ time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), text: updates.trim() }, ...l]);
    setUpdates("");
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    const all = [...log.map((l) => `${l.time} ${l.text}`), updates.trim()].filter(Boolean).join("\n");
    try {
      const res = await run({
        data: {
          updates: all,
          context,
          occupants: occupants.map((o) => ({
            id: `${o.id} (${o.name}, ${o.mobility})`,
            room: o.room,
            status: statuses[o.id] ?? o.status,
            condition: conditions[o.id] ?? "",
          })),
        },
      });
      if (res.error) setError(res.error);
      else setPlan(res.plan);
    } catch {
      setError("Could not reach the AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-cmd">
      <section className="ai-cmd-col">
        <h4>Incident updates</h4>
        <textarea value={updates} onChange={(e) => setUpdates(e.target.value)} placeholder="e.g. Smoke now entering Corridor 14C, Team A reports Stair B clear…" rows={3} />
        <div className="ai-cmd-btns">
          <button className="ghost" onClick={addUpdate}>Add to log</button>
        </div>
        {log.length > 0 && <ul className="ai-log">{log.map((l, i) => <li key={i}><em>{l.time}</em>{l.text}</li>)}</ul>}

        <h4>Occupant conditions</h4>
        <div className="oi-table-wrap">
          <table className="oi-table">
            <thead><tr><th>ID</th><th>Room</th><th>Status</th><th>Condition / notes</th></tr></thead>
            <tbody>
              {occupants.map((o) => (
                <tr key={o.id}>
                  <td><b>{o.id}</b><br /><small>{o.name}</small></td>
                  <td>{o.room}</td>
                  <td>
                    <select value={statuses[o.id] ?? o.status} onChange={(e) => setStatuses((s) => ({ ...s, [o.id]: e.target.value }))}>
                      <option>Critical</option><option>High Risk</option><option>Safe</option><option>Rescued</option>
                    </select>
                  </td>
                  <td><input value={conditions[o.id] ?? ""} onChange={(e) => setConditions((c) => ({ ...c, [o.id]: e.target.value }))} placeholder="Unconscious, burns, trapped…" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="ai-generate" onClick={generate} disabled={loading}>{loading ? "Generating rescue actions…" : "Generate prioritized rescue actions"}</button>
      </section>

      <section className="ai-cmd-col">
        <h4>AI rescue priorities</h4>
        {error && <div className="ai-error">{error}</div>}
        {!plan && !error && !loading && <p className="ai-empty">Enter updates and occupant conditions, then generate an AI-powered action plan.</p>}
        {loading && <p className="ai-empty">Analysing situation…</p>}
        {plan && !loading && (
          <>
            <p className="ai-summary">{plan.summary}</p>
            {plan.warnings.length > 0 && <ul className="ai-warn">{plan.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>}
            <ol className="ai-actions">
              {plan.actions.map((a) => (
                <li key={a.priority} className={`u-${a.urgency?.toLowerCase()}`}>
                  <span className="ai-rank">#{a.priority}</span>
                  <div>
                    <b>{a.action}</b>
                    <small>{a.urgency} · {a.target} · {a.assignee}</small>
                    <p>{a.reason}</p>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  );
}
