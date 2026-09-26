import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateRescuePlan, type RescuePlan } from "./rescue-ai.server";

const Input = z.object({
  updates: z.string().max(4000),
  context: z.string().max(4000),
  occupants: z
    .array(z.object({ id: z.string(), room: z.string(), status: z.string(), condition: z.string().max(500) }))
    .max(50),
});

const SYSTEM = `You are an incident-command assistant for indoor building fires. Given the commander's latest updates, the building situation, and occupant conditions, produce a prioritized list of rescue actions (most urgent first, max 8). Weigh life threat, mobility limits, proximity to fire/smoke, blocked routes and team availability. Reply ONLY with JSON:
{"summary": string, "warnings": string[], "actions": [{"priority": number, "urgency": "Immediate"|"High"|"Moderate", "action": string, "target": string, "assignee": string, "reason": string}]}`;

export const getRescueActions = createServerFn({ method: "POST" })
  .validator((d) => Input.parse(d))
  .handler(async ({ data }): Promise<{ plan: RescuePlan | null; error: string | null }> => {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { plan: null, error: "AI is not configured for this app." };
    const occ = data.occupants.map((o) => `- ${o.id} in ${o.room} [${o.status}]: ${o.condition || "no update"}`).join("\n");
    try {
      const plan = await generateRescuePlan(key, SYSTEM, [
        { role: "user", content: `Situation:\n${data.context}\n\nCommander updates:\n${data.updates || "(none)"}\n\nOccupant conditions:\n${occ}` },
      ]);
      return { plan, error: null };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { plan: null, error: "Too many requests right now. Please wait a moment and try again." };
      if (status === 402) return { plan: null, error: "AI credits have run out. Add credits in workspace settings to continue." };
      if (status === 403) return { plan: null, error: "AI access is blocked for this workspace." };
      return { plan: null, error: e instanceof Error ? e.message : "Could not generate actions." };
    }
  });
