import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESQ AI — Occupant Intelligence Fire Command Dashboard" },
      { name: "description", content: "RESQ AI indoor fire command dashboard with occupant intelligence, rescue teams, medical support, live cameras and incident timeline." },
      { property: "og:title", content: "RESQ AI — Occupant Intelligence Fire Command Dashboard" },
      { property: "og:description", content: "Track trapped occupants, prioritise rooms, dispatch rescue teams and route ambulances from one building command map." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type FloorId = "15" | "14" | "13" | "G";
type ViewId = "map" | "building" | "occupants" | "teams" | "medical" | "analytics" | "reports";
type Tone = "danger" | "warning" | "safe" | "info" | "muted";
type LayerId = "occupants" | "fire" | "heatmap" | "routes" | "blocked" | "sensors" | "cameras";
type Status = "Critical" | "High Risk" | "Safe";

type IconName = "shield" | "building" | "bell" | "chart" | "report" | "layers" | "eye" | "flame" | "smoke" | "sensor" | "route" | "exit" | "extinguisher" | "hydrant" | "camera" | "run" | "thermo" | "reset" | "play" | "check" | "warning" | "users" | "truck" | "hospital" | "nav" | "home";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="M12 7v7" /></>,
    building: <><path d="M4 21V5l8-3 8 3v16" /><path d="M8 21v-4h8v4" /><path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    chart: <><path d="M4 19h16" /><path d="M7 16V9" /><path d="M12 16V5" /><path d="M17 16v-6" /></>,
    report: <><path d="M7 3h8l4 4v14H7z" /><path d="M15 3v5h4" /><path d="M10 12h6M10 16h6" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    flame: <path d="M12 22c4 0 7-3 7-7 0-5-4-8-7-13-1 4-5 6-5 11 0 2 1 3 2 4 0-3 2-5 3-7 1 3 3 4 3 7 0 2-1 4-3 5Z" />,
    smoke: <><path d="M5 14c-2-1-2-4 1-5 1-3 6-3 7 0 3 0 5 2 5 5" /><path d="M7 18h10" /><path d="M9 21h6" /></>,
    sensor: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    route: <><circle cx="5" cy="19" r="2" /><circle cx="19" cy="5" r="2" /><path d="M7 19h4a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3" /></>,
    exit: <><path d="M13 3h6v18h-6" /><path d="M7 8 3 12l4 4" /><path d="M3 12h12" /></>,
    extinguisher: <><path d="M10 7h5v3h-5z" /><path d="M12 10h2a3 3 0 0 1 3 3v7H9v-7a3 3 0 0 1 3-3Z" /></>,
    hydrant: <><path d="M9 21h6" /><path d="M10 21v-9h4v9" /><path d="M8 12h8" /></>,
    camera: <><path d="M14.5 6 13 4H7L5.5 6H3v13h18V6h-6.5Z" /><circle cx="12" cy="12.5" r="4" /></>,
    run: <><circle cx="13" cy="4" r="2" /><path d="M8 21 11 14l-3-2-3 4" /><path d="m12 8 3 3 4 1" /><path d="m14 14 3 7" /></>,
    thermo: <><path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z" /></>,
    reset: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v6h6" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    warning: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5M12 18h.01" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><circle cx="17" cy="9" r="2.5" /><path d="M16 15c3 0 5 2 5 5" /></>,
    truck: <><path d="M2 7h11v10H2z" /><path d="M13 10h4l4 4v3h-8" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
    hospital: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7v10M16 7v10M8 12h8" /></>,
    nav: <path d="m3 11 18-8-8 18-2-8-8-2Z" />,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

/* ---------------- Data ---------------- */

const floors: { id: FloorId; label: string; subtitle: string }[] = [
  { id: "15", label: "15th Floor", subtitle: "Executive offices" },
  { id: "14", label: "14th Floor", subtitle: "Active incident" },
  { id: "13", label: "13th Floor", subtitle: "Operations" },
  { id: "G", label: "Ground Floor", subtitle: "Main exit" },
];

const navItems: { id: ViewId; label: string; icon: IconName }[] = [
  { id: "map", label: "Dashboard", icon: "home" },
  { id: "building", label: "Building", icon: "building" },
  { id: "occupants", label: "Occupants", icon: "users" },
  { id: "teams", label: "Rescue Teams", icon: "truck" },
  { id: "medical", label: "Medical", icon: "hospital" },
  { id: "analytics", label: "Analytics", icon: "chart" },
  { id: "reports", label: "Reports", icon: "report" },
];

type Occupant = { id: string; name: string; kind: "Human" | "Dog"; floor: FloorId; room: string; status: Status; mobility: string; source: string; confidence: number; lastSeen: string; heat: string; team: string };

const occupants: Occupant[] = [
  { id: "OC-01", name: "Adult male (~40)", kind: "Human", floor: "14", room: "14B-201", status: "Critical", mobility: "Not moving", source: "Thermal + CCTV", confidence: 97, lastSeen: "14:32:10", heat: "36.9°C", team: "Team B" },
  { id: "OC-02", name: "Adult female (~30)", kind: "Human", floor: "14", room: "14B-201", status: "Critical", mobility: "Crawling", source: "CCTV", confidence: 94, lastSeen: "14:32:08", heat: "37.1°C", team: "Team B" },
  { id: "OC-03", name: "Child (~8)", kind: "Human", floor: "14", room: "14B-201", status: "Critical", mobility: "Stationary", source: "Thermal", confidence: 91, lastSeen: "14:32:05", heat: "37.4°C", team: "Team B" },
  { id: "OC-04", name: "Pet dog", kind: "Dog", floor: "14", room: "14B-201", status: "Critical", mobility: "Moving", source: "Thermal", confidence: 88, lastSeen: "14:32:02", heat: "38.6°C", team: "Team B" },
  { id: "OC-05", name: "Adult male (~55)", kind: "Human", floor: "14", room: "14B-202", status: "High Risk", mobility: "Walking", source: "Wi-Fi + CCTV", confidence: 93, lastSeen: "14:31:58", heat: "36.8°C", team: "Team A" },
  { id: "OC-06", name: "Adult female (~25)", kind: "Human", floor: "14", room: "14B-204", status: "High Risk", mobility: "Walking", source: "CCTV", confidence: 95, lastSeen: "14:31:55", heat: "36.7°C", team: "Team A" },
  { id: "OC-07", name: "Adult male (~35)", kind: "Human", floor: "14", room: "14B-204", status: "High Risk", mobility: "Wheelchair", source: "Access badge", confidence: 99, lastSeen: "14:31:50", heat: "36.6°C", team: "Team A" },
  { id: "OC-08", name: "Adult female (~45)", kind: "Human", floor: "15", room: "15A-102", status: "Safe", mobility: "Evacuating", source: "Wi-Fi", confidence: 86, lastSeen: "14:31:40", heat: "36.5°C", team: "—" },
  { id: "OC-09", name: "Adult male (~28)", kind: "Human", floor: "15", room: "15A-104", status: "Safe", mobility: "Evacuating", source: "Access badge", confidence: 99, lastSeen: "14:31:38", heat: "36.6°C", team: "—" },
  { id: "OC-10", name: "Security guard", kind: "Human", floor: "13", room: "13C-010", status: "Safe", mobility: "Walking", source: "Radio check-in", confidence: 100, lastSeen: "14:31:30", heat: "36.4°C", team: "—" },
  { id: "OC-11", name: "Adult female (~60)", kind: "Human", floor: "13", room: "13A-105", status: "Safe", mobility: "Evacuating", source: "CCTV", confidence: 90, lastSeen: "14:31:25", heat: "36.7°C", team: "—" },
  { id: "OC-12", name: "Receptionist", kind: "Human", floor: "G", room: "Lobby", status: "Safe", mobility: "At assembly point", source: "Access badge", confidence: 100, lastSeen: "14:31:10", heat: "36.5°C", team: "—" },
];

type Room = { id: string; status: Status | "Safe"; tone: Tone; x: number; y: number; temp: string; smoke: string };
const rooms: Room[] = [
  { id: "14B-201", status: "Critical", tone: "danger", x: 452, y: 112, temp: "78°C", smoke: "High" },
  { id: "14B-202", status: "High Risk", tone: "warning", x: 600, y: 140, temp: "52°C", smoke: "Medium" },
  { id: "14B-203", status: "Safe", tone: "safe", x: 690, y: 180, temp: "29°C", smoke: "Low" },
  { id: "14B-204", status: "High Risk", tone: "warning", x: 300, y: 150, temp: "46°C", smoke: "Medium" },
];

const teams = [
  { id: "Team A", lead: "Capt. R. Sharma", members: 5, status: "On Site", target: "14B-204", eta: "—", unit: "Engine 12", equipment: "Hose line, SCBA ×5, Thermal camera" },
  { id: "Team B", lead: "Lt. A. Verma", members: 4, status: "En Route", target: "14B-201", eta: "3 min", unit: "Ladder 7", equipment: "Forced-entry kit, SCBA ×4, Stretcher" },
  { id: "Team C", lead: "Sgt. P. Khan", members: 4, status: "Available", target: "At Base", eta: "—", unit: "Rescue 3", equipment: "Rope rescue, Medical kit" },
];

const hospitals = [
  { name: "City General Hospital", distance: "2.4 km", eta: "6 min", beds: "12 ER beds", tags: ["Trauma Care", "Burn Unit", "Emergency"], recommended: true },
  { name: "St. Mary's Medical Centre", distance: "4.1 km", eta: "10 min", beds: "5 ER beds", tags: ["Emergency", "Pediatrics"], recommended: false },
  { name: "Metro Burn Institute", distance: "6.8 km", eta: "14 min", beds: "3 burn beds", tags: ["Burn Unit"], recommended: false },
];

const ambulances = [
  { id: "AMB-01", status: "Assigned", to: "Main Entrance", eta: "4 min" },
  { id: "AMB-02", status: "Standby", to: "Depot", eta: "—" },
  { id: "AMB-03", status: "Standby", to: "Depot", eta: "—" },
];

const timeline = [
  { t: "14:27", text: "System check complete", tone: "safe" as Tone, phase: 0 },
  { t: "14:28", text: "Fire detected — Room 14B-201", tone: "danger" as Tone, phase: 1 },
  { t: "14:28", text: "Risk level increased to Critical", tone: "danger" as Tone, phase: 2 },
  { t: "14:29", text: "4 occupants detected (3 Human, 1 Dog)", tone: "warning" as Tone, phase: 2 },
  { t: "14:29", text: "Smoke level high — Corridor 14B", tone: "warning" as Tone, phase: 3 },
  { t: "14:30", text: "Stair A blocked", tone: "danger" as Tone, phase: 4 },
  { t: "14:30", text: "Hospital notification sent", tone: "info" as Tone, phase: 5 },
  { t: "14:31", text: "Rescue Team B dispatched", tone: "info" as Tone, phase: 6 },
  { t: "14:32", text: "Ambulance AMB-01 assigned", tone: "safe" as Tone, phase: 7 },
];

const cameras = [
  { id: "CAM-14B-04", room: "14B-201", fire: 1 },
  { id: "CAM-14B-05", room: "14B-202", fire: 3 },
  { id: "CAM-14B-07", room: "14B-204", fire: 99 },
  { id: "CAM-14A-01", room: "Stair A", fire: 4 },
  { id: "CAM-14C-02", room: "Stair B", fire: 99 },
  { id: "CAM-GF-01", room: "Main Entrance", fire: 99 },
];

const statusTone = (s: Status): Tone => (s === "Critical" ? "danger" : s === "High Risk" ? "warning" : "safe");

type Modal =
  | { kind: "room"; id: string }
  | { kind: "occupant"; id: string }
  | { kind: "team"; id: string }
  | { kind: "cameras" }
  | { kind: "camera"; id: string }
  | { kind: "hospital" }
  | { kind: "timeline" }
  | { kind: "incident" }
  | null;

function Button({ children, variant = "secondary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return <button className={`fg-button fg-button-${variant} ${className}`} {...props}>{children}</button>;
}

/* ---------------- Dashboard ---------------- */

function Dashboard() {
  const [view, setView] = useState<ViewId>("map");
  const [floor, setFloor] = useState<FloorId>("14");
  const [phase, setPhase] = useState(7);
  const [running, setRunning] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  const [navigating, setNavigating] = useState(false);
  const [layers, setLayers] = useState<Record<LayerId, boolean>>({ occupants: true, fire: true, heatmap: false, routes: true, blocked: true, sensors: false, cameras: true });
  const [time, setTime] = useState<Date | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setTime(new Date());
    const clock = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  const clearTimers = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (!modal) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setModal(null); };
    document.body.classList.add("camera-modal-open");
    window.addEventListener("keydown", esc);
    return () => { document.body.classList.remove("camera-modal-open"); window.removeEventListener("keydown", esc); };
  }, [modal]);

  const simulate = () => {
    clearTimers();
    setFloor("14"); setView("map"); setPhase(1); setRunning(true); setModal(null); setNavigating(false);
    [2, 3, 4, 5, 6, 7].forEach((next, i) => {
      timers.current.push(window.setTimeout(() => { setPhase(next); if (next === 7) setRunning(false); }, (i + 1) * 1300));
    });
  };
  const reset = () => { clearTimers(); setFloor("14"); setView("map"); setPhase(0); setRunning(false); setModal(null); setNavigating(false); };

  const active = phase > 0;
  const displayTime = time?.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) ?? "14:32";
  const displayDate = time?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) ?? "24 Sep 2026";
  const atRisk = occupants.filter((o) => o.status !== "Safe").length;
  const critical = occupants.filter((o) => o.status === "Critical").length;

  return (
    <main className="fireguard-shell">
      <header className="topbar oi-topbar">
        <div className="fg-brand"><div className="fg-logo"><Icon name="flame" size={25} /></div><div><h1>RESQ<span>AI</span></h1><p>Detect · Locate · Rescue · Save Lives</p></div></div>
        <nav className="topnav" aria-label="Primary dashboard views">
          {navItems.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><Icon name={item.icon} size={17} />{item.label}</button>)}
        </nav>
        <div className="top-status">
          <Button variant="danger" onClick={simulate} disabled={running}><Icon name="play" size={14} />{running ? "Running" : "Simulate"}</Button>
          <Button onClick={reset}><Icon name="reset" size={14} />Reset</Button>
          <span className="online-dot" /><strong>{active ? "Incident Active" : "System Online"}</strong>
          <time><b>{displayTime}</b><small>{displayDate}</small></time>
        </div>
      </header>

      <section className="kpi-strip">
        <Kpi tone="danger" icon="flame" value={active ? "1" : "0"} label="Active Incident" sub={active ? "Room 14B-201" : "None"} onClick={() => setModal({ kind: "incident" })} />
        <Kpi tone="warning" icon="users" value={active ? String(atRisk) : "0"} label="People at Risk" sub={`${critical} Critical | ${atRisk - critical} High`} onClick={() => setView("occupants")} />
        <Kpi tone="danger" icon="warning" value={active ? "5" : "0"} label="Potentially Trapped" sub="14B-201 · 14B-204" onClick={() => setView("occupants")} />
        <Kpi tone="info" icon="truck" value={phase >= 6 ? "2" : "1"} label="Rescue Teams Active" sub="1 En Route | 1 On Site" onClick={() => setView("teams")} />
        <Kpi tone="safe" icon="exit" value={phase >= 4 ? "3 / 4" : "4 / 4"} label="Exits Available" sub={phase >= 4 ? "Stair A blocked" : "All clear"} onClick={() => setView("building")} />
        <Kpi tone="info" icon="hospital" value="3" label="Medical Support" sub="Hospitals nearby · 1 ambulance" onClick={() => setView("medical")} />
      </section>

      <section className="dashboard-grid oi-grid">
        <aside className="left-rail">
          <Panel title="Building Floors">
            <div className="floor-list">
              {floors.map((item) => {
                const count = occupants.filter((o) => o.floor === item.id && o.status !== "Safe").length;
                return <button key={item.id} className={floor === item.id ? "active" : ""} onClick={() => setFloor(item.id)}><Icon name="layers" size={18} /><span><b>{item.label}</b><small>{item.subtitle}</small></span><em className={count ? "count hot" : "count"}>{occupants.filter((o) => o.floor === item.id).length}</em></button>;
              })}
            </div>
          </Panel>
          <Panel title="Map Layers" className="layer-panel">
            {([["occupants", "Occupants", "users"], ["fire", "Fire / Smoke", "flame"], ["heatmap", "Risk Heatmap", "thermo"], ["routes", "Rescue Routes", "route"], ["blocked", "Blocked Routes", "warning"], ["sensors", "Sensors", "sensor"], ["cameras", "CCTV Cameras", "camera"]] as [LayerId, string, IconName][]).map(([id, label, icon]) =>
              <label key={id} className="layer-row"><Icon name={icon} size={16} /><span>{label}</span><input type="checkbox" checked={layers[id]} onChange={() => setLayers((l) => ({ ...l, [id]: !l[id] }))} /><i className="switch" /></label>)}
          </Panel>
        </aside>

        <section className="map-zone">
          {view === "map" || view === "building"
            ? <BuildingMap floor={floor} setFloor={setFloor} phase={phase} layers={layers} mode={mode} setMode={setMode} navigating={navigating} openRoom={(id) => setModal({ kind: "room", id })} />
            : <DetailWorkspace view={view} phase={phase} open={setModal} />}
        </section>

        <aside className="right-rail oi-right">
          <ActiveIncident phase={phase} open={setModal} />
          <WhyPriority phase={phase} />
          <RecommendedAction navigating={navigating} toggle={() => { setNavigating((n) => !n); setView("map"); setFloor("14"); }} openTeam={() => setModal({ kind: "team", id: "Team B" })} />
        </aside>

        <section className="bottom-row oi-bottom">
          <OccupantSummary onOpen={() => setView("occupants")} />
          <TeamsCard open={(id) => setModal({ kind: "team", id })} onAll={() => setView("teams")} />
          <MedicalCard onOpen={() => setModal({ kind: "hospital" })} onDetails={() => setView("medical")} />
          <CameraFeeds phase={phase} open={(id) => setModal({ kind: "camera", id })} onAll={() => setModal({ kind: "cameras" })} />
          <Timeline phase={phase} onAll={() => setModal({ kind: "timeline" })} />
        </section>
      </section>

      <footer className="oi-footer"><b>RESQ AI</b> v1.0 · AI-Powered Emergency Response System<span>Detect Faster · Respond Smarter · Save More Lives</span></footer>

      {modal && <ModalView modal={modal} phase={phase} close={() => setModal(null)} open={setModal} />}
    </main>
  );
}

function Panel({ title, children, className = "", action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return <section className={`fg-panel ${className}`}>{title && <h2 className="oi-h2">{title}{action}</h2>}{children}</section>;
}

function Kpi({ tone, icon, value, label, sub, onClick }: { tone: Tone; icon: IconName; value: string; label: string; sub: string; onClick: () => void }) {
  return <button className={`kpi ${tone}`} onClick={onClick}><Icon name={icon} size={30} /><span><strong>{value}</strong><b>{label}</b><small>{sub}</small></span></button>;
}

function CardHead({ icon, title, action, onAction }: { icon: IconName; title: string; action?: string; onAction?: () => void }) {
  return <div className="mini-head"><span><Icon name={icon} size={15} />{title}</span>{action && <button onClick={onAction}>{action} ›</button>}</div>;
}

/* ---------------- Map ---------------- */

function BuildingMap({ floor, setFloor, phase, layers, mode, setMode, navigating, openRoom }: { floor: FloorId; setFloor: (f: FloorId) => void; phase: number; layers: Record<LayerId, boolean>; mode: "3d" | "2d"; setMode: (m: "3d" | "2d") => void; navigating: boolean; openRoom: (id: string) => void }) {
  const active = floor === "14" && phase > 0;
  const fl = floors.find((f) => f.id === floor)!;
  return <div className="building-panel">
    <div className="map-title oi-map-title">
      <div><strong>{fl.label}</strong><span>Real-time AI Monitoring · Occupant Tracking · Rescue Coordination</span></div>
      <div className="map-switch">
        <button className={mode === "3d" ? "active" : ""} onClick={() => setMode("3d")}>3D View</button>
        <button className={mode === "2d" ? "active" : ""} onClick={() => setMode("2d")}>2D Plan</button>
        <select value={floor} onChange={(e) => setFloor(e.target.value as FloorId)} aria-label="Select floor">{floors.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select>
      </div>
    </div>
    {mode === "2d" ? <FloorPlan2D floor={floor} phase={phase} layers={layers} navigating={navigating} openRoom={openRoom} /> :
    <svg className="building-svg" viewBox="0 0 940 610" role="img" aria-label="Layered building map with occupants">
      <defs>
        <linearGradient id="glassTop" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--map-glass-high)" /><stop offset="1" stopColor="var(--map-glass-low)" /></linearGradient>
        <radialGradient id="fireGlow"><stop stopColor="var(--fire-core)" /><stop offset=".35" stopColor="var(--hazard)" /><stop offset="1" stopColor="transparent" /></radialGradient>
        <filter id="softGlow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path className="city-shadow" d="M105 478 458 586 861 416 503 317Z" />
      <g className="trees"><circle cx="110" cy="476" r="16" /><circle cx="148" cy="499" r="19" /><circle cx="771" cy="468" r="18" /><circle cx="822" cy="437" r="15" /><circle cx="706" cy="504" r="21" /></g>
      <path className="road" d="M62 524 418 607 900 437" />
      <g className="firetruck"><rect x="126" y="520" width="58" height="27" rx="3" /><rect x="157" y="510" width="22" height="15" /><circle cx="139" cy="550" r="5" /><circle cx="175" cy="550" r="5" /></g>
      <g className="ambulance-map"><rect x="800" y="470" width="44" height="22" rx="3" /><path d="M818 476v10M813 481h10" /></g>
      {layers.routes && <path className="hospital-route" d="M790 486 700 520" />}
      {layers.routes && <text className="map-note" x="760" y="530">To Hospital · 2.4 km · 6 min</text>}

      <FloorLayer y={318} label="Ground Floor" active={floor === "G"} layers={layers} />
      <FloorLayer y={241} label="13th Floor" active={floor === "13"} layers={layers} />
      <FloorLayer y={164} label="14th Floor" active={floor === "14"} incident={active} phase={phase} layers={layers} />
      <FloorLayer y={87} label="15th Floor" active={floor === "15"} layers={layers} />

      <g className="elevator-shaft"><path d="M528 117 642 145 642 441 528 411Z" /></g>
      {layers.routes && <g className="vertical-routes"><path d="M614 372 653 352 655 224 702 206" /><path d="M282 430 282 224 335 204" /></g>}
      {navigating && <path className="nav-route" d="M160 450 282 430 282 240 380 215 470 205 520 200" />}

      {active && layers.heatmap && <ellipse className="heat-zone" cx="500" cy="200" rx="220" ry="70" />}
      {active && layers.fire && <g className="incident-overlays" filter="url(#softGlow)">
        <path className="hot-zone" d="M468 161 613 196 560 239 414 201Z" />
        <ellipse className="fire-aura" cx="535" cy="198" rx="98" ry="68" />
        <path className="fire-core" d="M532 224c-34-18-26-56-4-77 2 21 16 28 16 45 9-17 9-38 2-58 41 31 58 80 22 101-13 8-25 3-36-11Z" />
      </g>}

      {floor === "14" && layers.occupants && <g className="people">
        {[[505, 214], [520, 222], [556, 216], [566, 206]].map(([x, y], i) => <Person key={i} x={x} y={y} tone="danger" />)}
        <Person x={640} y={196} tone="warning" />
        <Person x={360} y={212} tone="warning" /><Person x={376} y={218} tone="warning" />
      </g>}

      {floor === "14" && layers.occupants && rooms.map((r) => {
        const n = occupants.filter((o) => o.room === r.id).length;
        return <g key={r.id} className={`room-tag ${r.tone}`} transform={`translate(${r.x} ${r.y})`} onClick={() => openRoom(r.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") openRoom(r.id); }}>
          <rect width="98" height="46" rx="5" /><text x="9" y="16" className="t1">{r.id}</text><text x="9" y="31" className="t2">{n} {n === 1 ? "person" : "people"}</text><text x="9" y="42" className="t3">{active ? r.status : "Monitoring"}</text>
        </g>;
      })}

      {floor === "14" && active && phase >= 4 && layers.blocked && <g className="stair-tag danger" transform="translate(176 150)"><rect width="78" height="36" rx="5" /><text x="8" y="15">Stair A</text><text x="8" y="29">✕ Blocked</text></g>}
      {floor === "14" && layers.routes && <g className="stair-tag safe" transform="translate(770 210)"><rect width="84" height="36" rx="5" /><text x="8" y="15">Stair B</text><text x="8" y="29">Available</text></g>}
      {floor === "14" && phase >= 6 && <g className="team-tag" transform="translate(400 250)"><rect width="84" height="32" rx="5" /><text x="10" y="14">Team B</text><text x="10" y="26">{navigating ? "Navigating" : "En Route"}</text></g>}
      {layers.cameras && floor === "14" && <g className="cam-pins">{[[430, 176], [610, 186], [330, 196]].map(([x, y]) => <g key={x} transform={`translate(${x} ${y})`}><rect x="-6" y="-4" width="12" height="8" rx="2" /></g>)}</g>}
      <MapCallout x={120} y={438} text="Main Entrance" />
      <g className="floor-ticks"><FloorTick y={102} label="15th Floor" active={floor === "15"} /><FloorTick y={179} label="14th Floor" active={floor === "14"} /><FloorTick y={256} label="13th Floor" active={floor === "13"} /><FloorTick y={333} label="Ground Floor" active={floor === "G"} /></g>
    </svg>}
  </div>;
}

function Person({ x, y, tone }: { x: number; y: number; tone: Tone }) {
  return <g className={`person ${tone}`} transform={`translate(${x} ${y})`}><circle cy="-10" r="3.2" /><path d="M0-6v8M-4-2h8M0 2l-3 6M0 2l3 6" /></g>;
}

function FloorPlan2D({ floor, phase, layers, navigating, openRoom }: { floor: FloorId; phase: number; layers: Record<LayerId, boolean>; navigating: boolean; openRoom: (id: string) => void }) {
  const active = floor === "14" && phase > 0;
  const plan = [
    { id: "14B-204", x: 60, y: 60 }, { id: "14B-201", x: 260, y: 60 }, { id: "14B-202", x: 460, y: 60 }, { id: "14B-203", x: 660, y: 60 },
  ];
  return <svg className="building-svg plan-2d" viewBox="0 0 900 520" role="img" aria-label="2D floor plan">
    <rect x="20" y="20" width="860" height="480" rx="8" className="plan-outline" />
    <rect x="60" y="260" width="780" height="70" className="plan-corridor" /><text x="400" y="300" className="plan-label">Corridor 14B</text>
    <rect x="30" y="360" width="110" height="120" className={active && phase >= 4 ? "plan-stair blocked" : "plan-stair"} /><text x="45" y="425" className="plan-label">Stair A{active && phase >= 4 ? " ✕" : ""}</text>
    <rect x="760" y="360" width="110" height="120" className="plan-stair ok" /><text x="775" y="425" className="plan-label">Stair B</text>
    <rect x="400" y="360" width="100" height="120" className="plan-core" /><text x="415" y="425" className="plan-label">Lifts</text>
    {floor === "14" ? plan.map((p) => {
      const r = rooms.find((x) => x.id === p.id)!;
      const n = occupants.filter((o) => o.room === p.id).length;
      return <g key={p.id} className={`plan-room ${active && layers.heatmap ? r.tone : ""} ${active ? r.tone + "-line" : ""}`} onClick={() => openRoom(p.id)} role="button">
        <rect x={p.x} y={p.y} width="180" height="180" /><text x={p.x + 12} y={p.y + 26} className="plan-label">{p.id}</text>
        <text x={p.x + 12} y={p.y + 48} className="plan-sub">{n} occupants · {r.temp}</text>
        {layers.occupants && occupants.filter((o) => o.room === p.id).map((o, i) => <circle key={o.id} cx={p.x + 40 + i * 30} cy={p.y + 110} r="9" className={`plan-dot ${statusTone(o.status)}`} />)}
        {active && layers.fire && p.id === "14B-201" && <ellipse cx={p.x + 120} cy={p.y + 140} rx="40" ry="26" className="plan-fire" />}
      </g>;
    }) : <text x="330" y="160" className="plan-label">No active incident on this floor — monitoring</text>}
    {layers.routes && <path className="route-main" d="M340 240 340 295 815 295 815 360" />}
    {navigating && <path className="nav-route" d="M85 480 85 295 340 295 340 240" />}
  </svg>;
}

function FloorLayer({ y, label, active, incident = false, phase = 0, layers }: { y: number; label: string; active: boolean; incident?: boolean; phase?: number; layers: Record<LayerId, boolean> }) {
  return <g className={`floor-layer ${active ? "selected" : ""} ${incident ? "incident" : ""}`}>
    <path className="floor-side-front" d={`M168 ${y + 96} 512 ${y + 190} 813 ${y + 70} 813 ${y + 112} 512 ${y + 235} 168 ${y + 138}Z`} />
    <path className="floor-side-left" d={`M168 ${y + 20} 168 ${y + 138} 512 ${y + 235} 512 ${y + 114}Z`} />
    <path className="floor-top" d={`M168 ${y + 20} 512 ${y + 114} 813 ${y - 6} 466 ${y - 88}Z`} />
    <path className="floor-rim" d={`M168 ${y + 20} 512 ${y + 114} 813 ${y - 6} 466 ${y - 88}Z`} />
    <g className="rooms-grid">
      <path d={`M248 ${y + 42} 468 ${y - 25} 717 ${y + 36} 495 ${y + 117}Z`} />
      <path d={`M338 ${y + 66} 558 ${y - 2}`} /><path d={`M427 ${y + 90} 647 ${y + 23}`} /><path d={`M365 ${y + 6} 610 ${y + 66}`} />
    </g>
    <g className="building-details">
      <path className="stair-core" d={`M203 ${y + 36} 260 ${y + 51} 242 ${y + 72} 185 ${y + 57}Z`} />
      <path className="service-core" d={`M690 ${y + 20} 749 ${y + 35} 720 ${y + 58} 661 ${y + 43}Z`} />
    </g>
    <g className="room-windows">
      {Array.from({ length: 13 }, (_, i) => <rect key={i} x={220 + i * 42} y={y + 82 + (i % 2) * 4} width="10" height="18" />)}
    </g>
    {(active || incident) && layers.routes && <g className="floor-routes">
      <path className="route-main" d={`M216 ${y + 66} 342 ${y + 95} 443 ${y + 61} 572 ${y + 93} 735 ${y + 32}`} />
      <path className="exit-route" d={`M696 ${y + 43} 739 ${y + 30} 755 ${y + 37}`} />
    </g>}
    {incident && layers.blocked && phase >= 4 && <path className="blocked-route" d={`M255 ${y + 74} 221 ${y + 64} 205 ${y + 72}`} />}
    {incident && layers.sensors && <g className="sensor-points">
      <SensorDot x={428} y={y + 48} alert={phase >= 2} /><SensorDot x={514} y={y + 67} alert /><SensorDot x={616} y={y + 38} alert={phase >= 3} /><SensorDot x={312} y={y + 86} />
    </g>}
    <text className="floor-label" x="840" y={y + 38}>{label}</text>
  </g>;
}

function SensorDot({ x, y, alert = false }: { x: number; y: number; alert?: boolean }) {
  return <g className={alert ? "sensor-dot alert" : "sensor-dot"} transform={`translate(${x} ${y})`}><circle r="8" /><path d="M-3 0h6M0-3v6" /></g>;
}
function MapCallout({ x, y, text }: { x: number; y: number; text: string }) {
  return <g className="map-callout" transform={`translate(${x} ${y})`}><rect width={text.length * 7 + 18} height="27" rx="4" /><text x="10" y="18">{text}</text></g>;
}
function FloorTick({ y, label, active }: { y: number; label: string; active: boolean }) {
  return <g className={active ? "floor-tick active" : "floor-tick"}><path d={`M812 ${y}h42`} /><circle cx="812" cy={y} r="5" /><text x="862" y={y + 4}>{label}</text></g>;
}

/* ---------------- Right rail ---------------- */

function ActiveIncident({ phase, open }: { phase: number; open: (m: Modal) => void }) {
  const active = phase > 0;
  const inRoom = occupants.filter((o) => o.room === "14B-201").length;
  return <Panel className="active-incident">
    <div className="ai-head"><span><Icon name="flame" size={17} />ACTIVE INCIDENT</span><b className={active ? "crit" : ""}>{active ? "Critical" : "Standby"}</b></div>
    <h3>Room 14B-201 <small>14th Floor</small></h3>
    <div className="ai-body">
      <button className="ai-cam" onClick={() => open({ kind: "camera", id: "CAM-14B-04" })}><CameraScene active={active} camera="Live Camera" room="14B-201" /></button>
      <dl>
        <div><dt>Occupants</dt><dd>{inRoom}</dd></div>
        <div><dt>At Risk</dt><dd className="danger-value">{active ? inRoom : 0}</dd></div>
        <div><dt>Temperature</dt><dd>{active ? (phase >= 5 ? "89°C" : "78°C") : "23°C"}</dd></div>
        <div><dt>Smoke</dt><dd>{active ? "High" : "Clear"}</dd></div>
        <div><dt>Fire</dt><dd className="danger-value">{active ? (phase >= 3 ? "Spreading" : "Detected") : "—"}</dd></div>
      </dl>
    </div>
    <Button className="wide-action" onClick={() => open({ kind: "room", id: "14B-201" })}><Icon name="users" size={15} />View Occupants</Button>
  </Panel>;
}

function WhyPriority({ phase }: { phase: number }) {
  const score = phase > 0 ? Math.min(94, 60 + phase * 5) : 12;
  const bars = [4, 5, 5, 6, 7, 6, 8, 9, 8, 10, 11, 13, 12, 15, 17];
  return <Panel title="Why Priority #1?" className="why-panel">
    <div className="why-body">
      <ul>
        <li className="warning">4 occupants detected (1 dog)</li>
        <li className="danger">High temperature (78°C)</li>
        <li className="danger">High smoke level</li>
        <li className="danger">No safe exit (Stair A blocked)</li>
        <li className="danger">Risk increasing (predicted spread)</li>
      </ul>
      <div className="why-side">
        <div><small>Risk Trend</small><svg viewBox="0 0 90 30">{bars.map((b, i) => <rect key={i} x={i * 6} y={30 - b * 1.7 * Math.min(1, phase / 4 + 0.2)} width="4" height={b * 1.7 * Math.min(1, phase / 4 + 0.2)} />)}</svg><b>↗ Increasing</b></div>
        <div><small>Priority Score</small><strong>{score}<span> / 100</span></strong></div>
      </div>
    </div>
  </Panel>;
}

function RecommendedAction({ navigating, toggle, openTeam }: { navigating: boolean; toggle: () => void; openTeam: () => void }) {
  return <Panel title="Recommended Action" className="rec-panel">
    <div className="rec-body">
      <button className="rec-team" onClick={openTeam}><Icon name="users" size={22} /><span><b>Rescue Team B</b><small>En Route</small><em>ETA ~ 3 min</em></span></button>
      <ol><li className="safe">Stair B (Available)</li><li>Corridor 14B</li><li>Room 14B-201</li></ol>
    </div>
    <Button variant="primary" className="wide-action" onClick={toggle}><Icon name="nav" size={15} />{navigating ? "Stop Navigation" : "Start Navigation"}</Button>
    {navigating && <p className="nav-note">Route shown on map: Main Entrance → Stair B → Corridor 14B → 14B-201</p>}
  </Panel>;
}

/* ---------------- Bottom cards ---------------- */

function OccupantSummary({ onOpen }: { onOpen: () => void }) {
  const c = occupants.filter((o) => o.status === "Critical").length;
  const h = occupants.filter((o) => o.status === "High Risk").length;
  const s = occupants.length - c - h;
  const total = occupants.length;
  return <Panel className="occ-summary">
    <CardHead icon="users" title="Occupant Intelligence" action="View Details" onAction={onOpen} />
    <div className="occ-body">
      <div className="occ-donut" style={{ background: `conic-gradient(var(--destructive) 0 ${(c / total) * 360}deg, var(--warning) 0 ${((c + h) / total) * 360}deg, var(--safe) 0)` }}><span><strong>{total}</strong><small>Total Occupants</small></span></div>
      <ul><li className="danger"><i /><b>{c}</b> Critical</li><li className="warning"><i /><b>{h}</b> High Risk</li><li className="safe"><i /><b>{s}</b> Safe</li><li className="info"><i /><b>1</b> Animal</li></ul>
    </div>
  </Panel>;
}

function TeamsCard({ open, onAll }: { open: (id: string) => void; onAll: () => void }) {
  return <Panel className="teams-card">
    <CardHead icon="truck" title="Rescue Teams" action="View All" onAction={onAll} />
    {teams.map((t) => <button key={t.id} className={`team-row ${t.status === "En Route" ? "active" : ""}`} onClick={() => open(t.id)}><b>{t.id}</b><span className={t.status === "Available" ? "safe" : "info"}>● {t.status}</span><em>{t.target}<small>{t.eta}</small></em></button>)}
  </Panel>;
}

function MedicalCard({ onOpen, onDetails }: { onOpen: () => void; onDetails: () => void }) {
  const h = hospitals[0];
  return <Panel className="medical-card">
    <CardHead icon="hospital" title="Medical & Hospital" action="View Details" onAction={onDetails} />
    <div className="med-top"><Icon name="truck" size={26} /><span><strong>1 / 3</strong><small>Ambulances Assigned</small></span></div>
    <div className="med-hosp"><small>Recommended Hospital</small><b>{h.name}</b><div>{h.tags.map((t) => <em key={t}>{t} ✓</em>)}</div>
      <p><span>{h.distance} · ETA <b>{h.eta}</b></span><button onClick={onOpen}>View Route</button></p></div>
  </Panel>;
}

function CameraFeeds({ phase, open, onAll }: { phase: number; open: (id: string) => void; onAll: () => void }) {
  return <Panel className="cam-feeds">
    <CardHead icon="camera" title="Live Camera Feeds" action="View All" onAction={onAll} />
    <div className="cam-strip">{cameras.slice(0, 3).map((c) => <button key={c.id} onClick={() => open(c.id)}><CameraScene active={phase >= c.fire} camera={c.room} room="Live" /></button>)}</div>
  </Panel>;
}

function Timeline({ phase, onAll }: { phase: number; onAll: () => void }) {
  const items = timeline.filter((e) => e.phase <= phase).slice().reverse();
  return <Panel className="timeline-card">
    <CardHead icon="flame" title="Incident Timeline" action="View All" onAction={onAll} />
    <div className="tl-list">{items.map((e) => <div key={e.text} className={`tl-row ${e.tone}`}><time>{e.t}</time><i /><span>{e.text}</span></div>)}</div>
  </Panel>;
}

function CameraScene({ active, camera, room }: { active: boolean; camera: string; room: string }) {
  return <div className="camera-thumb">
    <svg viewBox="0 0 300 130" role="img" aria-label={`${camera} feed`}>
      <rect width="300" height="130" className="cam-bg" />
      <path className="cam-ceiling" d="M0 0h300l-82 51H82Z" /><path className="cam-floor" d="M0 130h300l-82-79H82Z" />
      <g className="cam-doors"><rect x="13" y="30" width="45" height="73" /><rect x="232" y="28" width="47" height="75" /><rect x="106" y="39" width="31" height="50" /></g>
      {active && <g><ellipse className="cam-fire-glow" cx="155" cy="83" rx="54" ry="42" /><path className="cam-fire" d="M154 103c-25-10-20-38-5-50 2 14 10 17 11 28 6-11 7-25 1-38 26 22 34 52 11 63-7 4-12 1-18-3Z" /><rect className="cam-detect" x="109" y="42" width="82" height="67" /></g>}
    </svg>
    <span className="camera-id">{camera}</span><time>● {room === "Live" ? "LIVE" : room}</time>
  </div>;
}

/* ---------------- Modals ---------------- */

function ModalView({ modal, phase, close, open }: { modal: NonNullable<Modal>; phase: number; close: () => void; open: (m: Modal) => void }) {
  let title = ""; let sub = ""; let body: ReactNode = null;
  if (modal.kind === "room") {
    const r = rooms.find((x) => x.id === modal.id);
    const list = occupants.filter((o) => o.room === modal.id);
    title = `Room ${modal.id}`; sub = r ? `${r.status} · Temp ${r.temp} · Smoke ${r.smoke}` : "";
    body = list.length ? <OccTable list={list} open={open} /> : <p className="empty">No occupants detected in this room.</p>;
  } else if (modal.kind === "occupant") {
    const o = occupants.find((x) => x.id === modal.id)!;
    title = `${o.id} — ${o.name}`; sub = `${o.kind} · Room ${o.room}`;
    body = <dl className="kv">{([["Status", o.status], ["Floor", floors.find((f) => f.id === o.floor)!.label], ["Room", o.room], ["Mobility", o.mobility], ["Detected via", o.source], ["AI confidence", `${o.confidence}%`], ["Body heat", o.heat], ["Last seen", o.lastSeen], ["Assigned team", o.team]] as [string, string][]).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
  } else if (modal.kind === "team") {
    const t = teams.find((x) => x.id === modal.id)!;
    title = t.id; sub = `${t.unit} · ${t.status}`;
    body = <><dl className="kv">{([["Team lead", t.lead], ["Members", String(t.members)], ["Status", t.status], ["Target", t.target], ["ETA", t.eta], ["Equipment", t.equipment]] as [string, string][]).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <h4>Occupants assigned</h4><OccTable list={occupants.filter((o) => o.team === t.id)} open={open} /></>;
  } else if (modal.kind === "cameras" || modal.kind === "camera") {
    const list = modal.kind === "camera" ? cameras.filter((c) => c.id === modal.id) : cameras;
    title = modal.kind === "camera" ? list[0].id : "All Camera Feeds"; sub = "Floor 14 incident coverage and access points";
    body = <div className={modal.kind === "camera" ? "camera-grid single" : "camera-grid"}>{list.map((c) => <article key={c.id} className={phase >= c.fire ? "camera-card alert" : "camera-card"}><CameraScene active={phase >= c.fire} camera={c.id} room={c.room} /><footer><span>{c.room}</span><b>{phase >= c.fire ? "ALERT" : "ONLINE"}</b></footer></article>)}</div>;
  } else if (modal.kind === "hospital") {
    title = "Hospital Route"; sub = "Building → City General Hospital";
    body = <><svg viewBox="0 0 500 180" className="route-svg"><path d="M40 140 150 140 200 80 330 80 380 40 460 40" /><circle cx="40" cy="140" r="8" /><circle cx="460" cy="40" r="8" className="end" /><text x="20" y="165">RESQ Tower</text><text x="380" y="25">City General</text></svg><HospitalTable /></>;
  } else if (modal.kind === "timeline") {
    title = "Incident Timeline"; sub = "Full event log for incident RQ-2291";
    body = <div className="tl-list full">{timeline.map((e) => <div key={e.text} className={`tl-row ${e.tone} ${e.phase > phase ? "pending" : ""}`}><time>{e.t}</time><i /><span>{e.text}</span><b>{e.phase <= phase ? "Done" : "Pending"}</b></div>)}</div>;
  } else if (modal.kind === "incident") {
    title = "Incident RQ-2291"; sub = "Room 14B-201 · 14th Floor";
    body = <><dl className="kv">{([["Severity", phase > 0 ? "Critical" : "Standby"], ["Detected", "14:28 by CAM-14B-04"], ["AI confidence", "96%"], ["Temperature", "78°C"], ["Occupants at risk", "7"], ["Affected zones", "14B-201, 14B-202, 14B-204, Corridor 14B"], ["Blocked exits", "Stair A"], ["Teams", "Team A on site, Team B en route"]] as [string, string][]).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Button onClick={() => open({ kind: "room", id: "14B-201" })}>Open room occupants</Button></>;
  }
  return <div className="camera-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
    <section className="camera-gallery oi-modal">
      <header><div><span className="gallery-live"><i />RESQ AI</span><h2>{title}</h2><p>{sub}</p></div><button aria-label="Close" onClick={close}>×</button></header>
      <div className="oi-modal-body">{body}</div>
    </section>
  </div>;
}

function OccTable({ list, open }: { list: Occupant[]; open: (m: Modal) => void }) {
  return <div className="oi-table-wrap"><table className="oi-table"><thead><tr><th>ID</th><th>Occupant</th><th>Room</th><th>Status</th><th>Mobility</th><th>Source</th><th>Conf.</th><th>Team</th></tr></thead>
    <tbody>{list.map((o) => <tr key={o.id} onClick={() => open({ kind: "occupant", id: o.id })}><td>{o.id}</td><td>{o.name}{o.kind === "Dog" ? " 🐕" : ""}</td><td>{o.room}</td><td><span className={`pill ${statusTone(o.status)}`}>{o.status}</span></td><td>{o.mobility}</td><td>{o.source}</td><td>{o.confidence}%</td><td>{o.team}</td></tr>)}</tbody></table></div>;
}

function HospitalTable() {
  return <div className="oi-table-wrap"><table className="oi-table"><thead><tr><th>Hospital</th><th>Distance</th><th>ETA</th><th>Capacity</th><th>Services</th></tr></thead>
    <tbody>{hospitals.map((h) => <tr key={h.name}><td>{h.name}{h.recommended ? " ★" : ""}</td><td>{h.distance}</td><td>{h.eta}</td><td>{h.beds}</td><td>{h.tags.join(", ")}</td></tr>)}</tbody></table></div>;
}

/* ---------------- Detail views ---------------- */

function DetailWorkspace({ view, phase, open }: { view: Exclude<ViewId, "map" | "building">; phase: number; open: (m: Modal) => void }) {
  const meta: Record<typeof view, [string, string, IconName]> = {
    occupants: ["Occupant Intelligence", "Every detected person and animal, fused from CCTV, thermal, Wi-Fi and access badges. Click a row for full profile.", "users"],
    teams: ["Rescue Teams", "Live status, assignments and equipment for all field teams.", "truck"],
    medical: ["Medical & Hospital Support", "Nearby hospitals, ambulance assignment and triage readiness.", "hospital"],
    analytics: ["Incident Analytics", "Model confidence and risk indicators for the current incident.", "chart"],
    reports: ["Response Report", "Generated command record for operations teams.", "report"],
  };
  const [title, desc, icon] = meta[view];
  let body: ReactNode = null;
  if (view === "occupants") {
    const byFloor = floors.map((f) => ({ f, n: occupants.filter((o) => o.floor === f.id).length, r: occupants.filter((o) => o.floor === f.id && o.status !== "Safe").length }));
    body = <><div className="oi-stats">{byFloor.map(({ f, n, r }) => <div key={f.id}><small>{f.label}</small><strong>{n}</strong><span>{r} at risk</span></div>)}</div><OccTable list={occupants} open={open} /></>;
  } else if (view === "teams") {
    body = <div className="oi-cards">{teams.map((t) => <button key={t.id} onClick={() => open({ kind: "team", id: t.id })}><b>{t.id}</b><span>{t.lead} · {t.members} members</span><span>{t.unit}</span><em>{t.status} → {t.target} {t.eta !== "—" ? `(${t.eta})` : ""}</em><small>{t.equipment}</small></button>)}</div>;
  } else if (view === "medical") {
    body = <><HospitalTable /><h4>Ambulances</h4><div className="oi-table-wrap"><table className="oi-table"><thead><tr><th>Unit</th><th>Status</th><th>Destination</th><th>ETA</th></tr></thead><tbody>{ambulances.map((a) => <tr key={a.id}><td>{a.id}</td><td>{a.status}</td><td>{a.to}</td><td>{a.eta}</td></tr>)}</tbody></table></div>
      <h4>Triage forecast</h4><div className="oi-stats"><div><small>Burns</small><strong>2</strong></div><div><small>Smoke inhalation</small><strong>4</strong></div><div><small>Mobility assist</small><strong>1</strong></div><div><small>Veterinary</small><strong>1</strong></div></div></>;
  } else if (view === "analytics") {
    const values: [string, number][] = [["Detection Confidence", phase > 0 ? 96 : 11], ["Spread Risk", phase > 2 ? 82 : 18], ["Occupancy Certainty", phase > 1 ? 93 : 34], ["Route Safety (Stair B)", phase > 5 ? 88 : 99], ["Stair A Safety", phase >= 4 ? 12 : 95]];
    body = <div className="analytics-list">{values.map(([label, value]) => <div className="analytics-row" key={label}><div><span>{label}</span><strong>{value}%</strong></div><i><b style={{ width: `${value}%` }} /></i></div>)}</div>;
  } else {
    body = <div className="report-sheet"><h3>Incident RQ-2291</h3><p>AI detected a fire signature in Room 14B-201, identified 12 occupants (7 at risk incl. 1 dog), blocked Stair A and routed Team B via Stair B. Ambulance AMB-01 is assigned to City General Hospital.</p><dl><div><dt>Status</dt><dd>{phase >= 7 ? "Units dispatched" : phase > 0 ? "In progress" : "Draft"}</dd></div><div><dt>Affected zones</dt><dd>14B-201, 14B-202, 14B-204, Corridor 14B</dd></div><div><dt>Recommended action</dt><dd>Evacuate via Stair B; responders through main entrance.</dd></div></dl><Button onClick={() => window.print()}><Icon name="report" size={15} />Print report</Button></div>;
  }
  return <Panel className="detail-workspace"><div className="detail-title"><Icon name={icon} size={22} /><div><h2>{title}</h2><p>{desc}</p></div></div><div className="detail-scroll">{body}</div></Panel>;
}
