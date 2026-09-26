# RESQ Command

Build a fully interactive, front-end-only web prototype called "RESQ AI — Intelligent Fire Detection, Risk Prediction & Rescue Command Dashboard (Indoor Building Scenario)."

CONTEXT:

RESQ AI is designed for INDOOR environments — high-rise buildings, offices, industrial plants — unifying fire/smoke detection, risk prediction, and rescue coordination into one AI-driven command pipeline for a single building/floor.

BUILD A SINGLE-PAGE DASHBOARD WITH THESE SECTIONS/TABS:

1. LIVE DETECTION FEED (Module 1)

   - A simulated indoor CCTV feed panel labeled "CAM 14B — CORRIDOR, FLOOR 14" with a REC indicator

   - Overlay showing live confidence scores: "Fire: 0.94", "Smoke: 0.88"

   - A thermal overlay toggle showing "Peak temp: 480°C"

   - A small log list of recent detection events with timestamps (e.g., "Smoke detected — Zone B2 — 14:32:05")

2. INDOOR FLOOR PLAN — RISK PREDICTION (Module 2)

   - Render a simple top-down INDOOR FLOOR PLAN using SVG/CSS: a grid of rooms, corridors, staircases/exit points, and elevator shaft — labeled zones (A1, A2, B1, B2, C1, C2, C3 etc.)

   - Mark the fire origin room clearly (e.g., Zone 14-B) with a flame icon

   - Show animated fire/smoke spread across adjacent rooms and corridors at t+2min, t+5min, t+10min (rooms change color from yellow → orange → red as fire spreads through doors/corridors, respecting wall boundaries)

   - Composite risk score gauge (e.g., "82/100 — HIGH") with breakdown bars: Material Flammability, Occupancy Density, Ventilation Risk

3. COMMAND & RESCUE DASHBOARD (Module 3)

   - Incident card: "INCIDENT #RQ-2291 · SEVERITY: HIGH · Unit ETA: 03:40"

   - On the SAME indoor floor plan: 

     - Mark detected occupant/victim locations (dots) inside rooms via a "victims detected" overlay

     - Draw the SAFEST EGRESS ROUTE for occupants (green dashed path) from affected rooms to the nearest stairwell/exit, avoiding the fire zone

     - Draw the RESPONDER INGRESS ROUTE (red dashed path) from the building entrance/stairwell to the fire zone

     - Routes should visually re-route/update if a corridor becomes blocked by spreading fire

   - "Multi-Agency Alert" panel showing dispatch status to Fire / Medical / Security teams (with a "Dispatch Now" button triggering a status animation)

4. SYSTEM FLOW / TIMELINE VIEW

   - A horizontal step tracker: Alert Trigger → Edge Validation → Cloud Confirmation → Risk Assessment → Hub Notification → Route Planning → Dispatch & Execution

   - Each step lights up sequentially with a timestamp when "Simulate Indoor Fire Incident" is clicked

5. TOP-LEVEL CONTROLS

   - A prominent "Simulate Fire Incident" button that animates the entire indoor floor plan live over ~10-15 seconds: detection triggers → risk score populates → fire spreads room-by-room on the floor plan → egress/ingress routes draw and adjust → alerts dispatch — telling the "golden minute" story entirely on the indoor layout

   - A reset button

   - Optional: a floor selector (e.g., Floor 13 / 14 / 15) to show the system scales across a multi-floor building

DESIGN REQUIREMENTS:

- Dark, control-room / command-center aesthetic (dark navy/black background, red/orange accents for danger, green for safe/egress, amber for warnings)

- The indoor floor plan is the visual centerpiece — clean architectural line-drawing style (rooms as rectangles, doors as gaps in walls, corridors as connecting paths, stairwell/exit icons)

- Clean sans-serif typography, card-based layout, subtle glow/pulse on active/live elements

- Fully responsive, no external image/API dependencies — build the floor plan and all visuals purely in CSS/SVG

- All data mock/simulated with realistic numbers (no backend needed)

- Smooth transitions so the fire-spread-through-rooms and route-drawing animations feel convincing for a live demo

TECH:

- Single self-contained HTML file (HTML+CSS+JS) OR a React component, whichever the tool supports natively

- No external dependencies

- Prioritize a convincing, well-animated indoor simulation over backend logic — this is a pitch/demo prototype

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8809ecae-d2fe-4cf6-b454-4933f9850481).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
