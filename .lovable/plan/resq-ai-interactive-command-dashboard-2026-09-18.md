# RESQ AI Interactive Command Dashboard

## Goal
Build a single-page, front-end-only control-room prototype that turns the uploaded RESQ AI presentation into a convincing indoor fire-response simulation. The architectural floor plan remains the visual centerpiece throughout the experience.

## Experience
- Persistent command header with building/floor status, Floor 13/14/15 selector, live clock, prominent **Simulate Fire Incident** control, and reset.
- Four switchable workspaces: **Live Detection**, **Risk Prediction**, **Rescue Command**, and **System Flow**.
- One shared Floor 14 indoor plan reused across prediction and rescue views so fire spread, victims, blocked corridors, and both route types stay spatially consistent.
- A 10–15 second scripted “golden minute” sequence: camera anomaly → confidence validation → risk calculation → staged spread → victim detection → route planning → corridor blockage and reroute → agency dispatch.

## Visual Direction
- Dense, restrained emergency-operations interface in near-black/navy with architectural cyan-gray linework.
- Danger red/orange, warning amber, safe-route green, and cool neutral information states, all defined as semantic design tokens.
- Compact sans-serif typography, tabular numerals, thin borders, subtle grid texture, scanline/camera treatment, and controlled glow only on live or changing states.
- Responsive composition: multi-column desktop command center; stacked mobile panels with the floor plan preserved at a stable, readable aspect ratio.

## Core Build

### Live Detection
- Simulated corridor CCTV scene drawn entirely with CSS/SVG, including perspective walls, doors, smoke, flame, bounding boxes, timestamp, REC marker, camera label, and confidence readouts.
- Working thermal overlay switch that changes the feed treatment and reveals peak temperature of 480°C.
- Realistic timestamped detection log populated as the simulation progresses.

### Indoor Risk Prediction
- SVG architectural plan with labeled rooms/zones, central corridors, doors, two stair/exit points, elevator core, utilities, and fire origin in Zone 14-B/B2.
- Time controls for Current, t+2, t+5, and t+10 minutes.
- Animated, wall-aware hazard states moving through connected rooms and corridors from yellow to orange to red, plus smoke visualization.
- Animated 82/100 HIGH composite risk gauge and breakdown bars for flammability, occupancy, and ventilation.

### Rescue Command
- Incident summary for RQ-2291 with severity, ETA, victim count, and affected zones.
- Victim markers in B2, C1, and C3 with a visibility toggle.
- Animated green dashed occupant egress routes and red dashed responder ingress route.
- Mid-simulation corridor closure that visibly marks the blockage and replaces unsafe paths with alternate routes.
- Fire, Medical, and Security dispatch panel with a working Dispatch Now action and sequential status transitions.

### System Flow
- Seven-step horizontal tracker matching the presentation: Alert Trigger, Edge Validation, Cloud Confirmation, Risk Assessment, Hub Notification, Route Planning, Dispatch & Execution.
- Steps activate sequentially with generated incident timestamps and completed/current states.

## Interaction & State
- Central simulation controller coordinates every panel and keeps manual timeline/tab interactions consistent.
- Simulation can be paused by reset, safely restarted, and replayed without stale timers.
- Floor selector changes contextual labels; Floor 14 hosts the active incident while adjacent floors show monitoring/standby states.
- Respect reduced-motion preferences while retaining clear state changes.

## Technical Notes
- React/TanStack single page with no backend, API calls, or external media.
- All visual assets are inline SVG/CSS; icons use lightweight inline SVG components.
- Componentize the floor plan, camera feed, timeline, risk panel, dispatch panel, and shared controls.
- Add route-specific title, description, Open Graph metadata, and Twitter card metadata.
- Validate the complete scripted flow and layouts at desktop and mobile viewport sizes.
