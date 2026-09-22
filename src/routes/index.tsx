import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESQ AI — FireGuard Building Command Map" },
      { name: "description", content: "A FireGuard-style RESQ AI building command dashboard with indoor fire detection, floor mapping, evacuation status, and live incident simulation." },
      { property: "og:title", content: "RESQ AI — FireGuard Building Command Map" },
      { property: "og:description", content: "Interactive indoor rescue dashboard with a layered building map, live alerts, sensor status, and evacuation routing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type FloorId = "15" | "14" | "13" | "G";
type ViewId = "map" | "alerts" | "analytics" | "reports";

const floors: { id: FloorId; label: string; subtitle: string }[] = [
  { id: "15", label: "15th Floor", subtitle: "Executive offices" },
  { id: "14", label: "14th Floor", subtitle: "Active incident" },
  { id: "13", label: "13th Floor", subtitle: "Operations" },
  { id: "G", label: "Ground Floor", subtitle: "Main exit" },
];

const navItems: { id: ViewId; label: string; icon: IconName }[] = [
  { id: "map", label: "Building Map", icon: "building" },
  { id: "alerts", label: "Live Alerts", icon: "bell" },
  { id: "analytics", label: "Analytics", icon: "chart" },
  { id: "reports", label: "Reports", icon: "report" },
];

type IconName = "shield" | "building" | "bell" | "chart" | "report" | "layers" | "eye" | "flame" | "smoke" | "sensor" | "route" | "exit" | "extinguisher" | "hydrant" | "camera" | "run" | "thermo" | "reset" | "play" | "check" | "warning";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="M12 7v7" /><path d="m9 11 3 3 3-3" /></>,
    building: <><path d="M4 21V5l8-3 8 3v16" /><path d="M8 21v-4h8v4" /><path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    chart: <><path d="M4 19h16" /><path d="M7 16V9" /><path d="M12 16V5" /><path d="M17 16v-6" /><path d="m7 9 5-4 5 5" /></>,
    report: <><path d="M7 3h8l4 4v14H7z" /><path d="M15 3v5h4" /><path d="M10 12h6M10 16h6" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    flame: <path d="M12 22c4 0 7-3 7-7 0-5-4-8-7-13-1 4-5 6-5 11 0 2 1 3 2 4 0-3 2-5 3-7 1 3 3 4 3 7 0 2-1 4-3 5Z" />,
    smoke: <><path d="M5 14c-2-1-2-4 1-5 1-3 6-3 7 0 3 0 5 2 5 5" /><path d="M7 18h10" /><path d="M9 21h6" /></>,
    sensor: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></>,
    route: <><circle cx="5" cy="19" r="2" /><circle cx="19" cy="5" r="2" /><path d="M7 19h4a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3" /></>,
    exit: <><path d="M13 3h6v18h-6" /><path d="M7 8 3 12l4 4" /><path d="M3 12h12" /></>,
    extinguisher: <><path d="M10 7h5v3h-5z" /><path d="M12 7V4h5" /><path d="M12 10h2a3 3 0 0 1 3 3v7H9v-7a3 3 0 0 1 3-3Z" /><path d="M11 15h4" /></>,
    hydrant: <><path d="M9 21h6" /><path d="M10 21v-9h4v9" /><path d="M8 12h8" /><path d="M7 16H4v-4h3M17 16h3v-4h-3" /><path d="M10 9a2 2 0 0 1 4 0v3h-4Z" /></>,
    camera: <><path d="M14.5 6 13 4H7L5.5 6H3v13h18V6h-6.5Z" /><circle cx="12" cy="12.5" r="4" /></>,
    run: <><circle cx="13" cy="4" r="2" /><path d="M8 21 11 14l-3-2-3 4" /><path d="m12 8 3 3 4 1" /><path d="m10 10 3-3 2 3" /><path d="m14 14 3 7" /></>,
    thermo: <><path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z" /><path d="M12 9v7" /></>,
    reset: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v6h6" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    warning: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5M12 18h.01" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Button({ children, variant = "secondary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return <button className={`fg-button fg-button-${variant} ${className}`} {...props}>{children}</button>;
}

function Dashboard() {
  const [view, setView] = useState<ViewId>("map");
  const [floor, setFloor] = useState<FloorId>("14");
  const [phase, setPhase] = useState(4);
  const [running, setRunning] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setTime(new Date());
    const clock = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const simulate = () => {
    clearTimers();
    setFloor("14");
    setView("map");
    setPhase(1);
    setRunning(true);
    setCameraOpen(false);
    [
      [900, 2],
      [2100, 3],
      [3500, 4],
      [5200, 5],
      [6900, 6],
      [8700, 7],
    ].forEach(([delay, next]) => {
      timers.current.push(window.setTimeout(() => {
        setPhase(next);
        if (next === 7) setRunning(false);
      }, delay));
    });
  };

  const reset = () => {
    clearTimers();
    setFloor("14");
    setView("map");
    setPhase(0);
    setRunning(false);
    setCameraOpen(false);
  };

  const incidentActive = floor === "14" && phase > 0;
  const displayTime = time?.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) ?? "14:32";
  const displayDate = time?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) ?? "17 Sep 2026";

  return (
    <main className="fireguard-shell">
      <header className="topbar">
        <div className="fg-brand" aria-label="RESQ AI FireGuard">
          <div className="fg-logo"><Icon name="flame" size={25} /></div>
          <div><h1>RESQ<span>AI</span></h1><p>Detect · Respond · Save Lives</p></div>
        </div>

        <nav className="topnav" aria-label="Primary dashboard views">
          {navItems.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><Icon name={item.icon} size={17} />{item.label}</button>)}
        </nav>

        <div className="top-status">
          <span className="online-dot" />
          <strong>{incidentActive ? "Incident Active" : "System Online"}</strong>
          <time><b>{displayTime}</b><small>{displayDate}</small></time>
        </div>
      </header>

      <section className="dashboard-grid">
        <aside className="left-rail">
          <Panel title="Floors">
            <div className="floor-list">
              {floors.map((item) => <button key={item.id} className={floor === item.id ? "active" : ""} onClick={() => setFloor(item.id)}><Icon name="layers" size={18} /><span><b>{item.label}</b><small>{item.subtitle}</small></span><Icon name={floor === item.id ? "eye" : "route"} size={15} /></button>)}
            </div>
          </Panel>

          <Panel title="Legend" className="legend-card">
            <LegendRow icon="flame" label="Fire Zone" tone="danger" />
            <LegendRow icon="smoke" label="Smoke Zone" tone="warning" />
            <LegendRow icon="sensor" label="Fire Sensor Active" tone="danger" />
            <LegendRow icon="sensor" label="Sensor Normal" tone="muted" />
            <LegendRow icon="route" label="Evacuation Route" tone="safe" />
            <LegendRow icon="exit" label="Fire Exit" tone="safe" />
            <LegendRow icon="extinguisher" label="Fire Extinguisher" tone="danger" />
            <LegendRow icon="hydrant" label="Fire Hydrant" tone="info" />
          </Panel>

          <Panel className="compass-card">
            <div className="compass"><span>N</span><i /><b>W</b><strong>E</strong><em>S</em></div>
            <div className="map-tools"><button aria-label="Zoom in">+</button><button aria-label="Zoom out">−</button><button aria-label="Reset map"><Icon name="reset" size={15} /></button></div>
          </Panel>
        </aside>

        <section className="map-zone">
          {view === "map" ? <BuildingMap floor={floor} phase={phase} /> : <DetailWorkspace view={view} phase={phase} />}
        </section>

        <aside className="right-rail">
          <IncidentDetails active={incidentActive} phase={phase} openCamera={() => setCameraOpen(true)} />
          <SensorStatus phase={phase} />
          <EvacuationStatus phase={phase} />
          <MiniMap floor={floor} setFloor={setFloor} phase={phase} />
        </aside>

        <section className="bottom-row">
          <LiveCamera phase={phase} open={cameraOpen} openCamera={() => setCameraOpen(true)} closeCamera={() => setCameraOpen(false)} />
          <RecentAlerts phase={phase} />
          <BuildingOverview phase={phase} />
          <SimulationControls running={running} phase={phase} simulate={simulate} reset={reset} />
        </section>
      </section>
    </main>
  );
}

function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return <section className={`fg-panel ${className}`}>{title && <h2>{title}</h2>}{children}</section>;
}

function LegendRow({ icon, label, tone }: { icon: IconName; label: string; tone: "danger" | "warning" | "safe" | "info" | "muted" }) {
  return <div className={`legend-row ${tone}`}><Icon name={icon} size={18} /><span>{label}</span></div>;
}

function BuildingMap({ floor, phase }: { floor: FloorId; phase: number }) {
  const active = floor === "14" && phase > 0;
  return <div className="building-panel">
    <div className="map-title"><Icon name="building" size={17} /><div><strong>Building View</strong><span>3D Digital Twin · Fire Safety Monitoring</span></div></div>
    <svg className="building-svg" viewBox="0 0 940 610" role="img" aria-label="Layered indoor building map with fire incident on floor 14">
      <defs>
        <linearGradient id="glassTop" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--map-glass-high)" /><stop offset="1" stopColor="var(--map-glass-low)" /></linearGradient>
        <linearGradient id="glassSide" x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--map-side-high)" /><stop offset="1" stopColor="var(--map-side-low)" /></linearGradient>
        <linearGradient id="routeGlow" x1="0" y1="0" x2="1" y2="0"><stop stopColor="var(--safe)" /><stop offset="1" stopColor="var(--route-bright)" /></linearGradient>
        <radialGradient id="fireGlow"><stop stopColor="var(--fire-core)" /><stop offset=".35" stopColor="var(--hazard)" /><stop offset="1" stopColor="transparent" /></radialGradient>
        <filter id="softGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      <path className="city-shadow" d="M105 478 458 586 861 416 503 317Z" />
      <g className="trees"><circle cx="110" cy="476" r="16"/><circle cx="148" cy="499" r="19"/><circle cx="771" cy="468" r="18"/><circle cx="822" cy="437" r="15"/><circle cx="706" cy="504" r="21"/></g>
      <path className="road" d="M62 524 418 607 900 437" />
      <path className="road" d="M175 590 250 488 773 328" />
      <g className="firetruck"><rect x="126" y="520" width="58" height="27" rx="3"/><rect x="157" y="510" width="22" height="15"/><circle cx="139" cy="550" r="5"/><circle cx="175" cy="550" r="5"/></g>

      <FloorLayer y={318} label="Ground Floor" active={floor === "G"} />
      <FloorLayer y={241} label="13th Floor" active={floor === "13"} />
      <FloorLayer y={164} label="14th Floor" active={floor === "14"} incident={active} phase={phase} />
      <FloorLayer y={87} label="15th Floor" active={floor === "15"} />

      <g className="elevator-shaft"><path d="M528 117 642 145 642 441 528 411Z"/><path d="M543 128 625 149 625 421 543 399Z"/></g>
      <g className="vertical-routes"><path d="M614 372 653 352 655 224 702 206"/><path d="M282 430 282 224 335 204"/></g>

      {active && <g className="incident-overlays" filter="url(#softGlow)">
        <path className="hot-zone" d="M468 161 613 196 560 239 414 201Z" />
        <ellipse className="fire-aura" cx="535" cy="198" rx="98" ry="68" />
        <path className="fire-core" d="M532 224c-34-18-26-56-4-77 2 21 16 28 16 45 9-17 9-38 2-58 41 31 58 80 22 101-13 8-25 3-36-11Z" />
        <path className="fire-inner" d="M539 217c-15-10-13-31 2-44 1 13 9 18 9 28 7-10 7-19 4-29 20 20 19 42 2 49-6 3-12 1-17-4Z" />
        <g className="target-pin" transform="translate(529 204)"><circle r="24"/><circle r="9"/><path d="M-39 0h24M15 0h24M0-39v24M0 15v24"/></g>
      </g>}

      <g className="building-labels">
        <MapCallout x={172} y={130} text="Server Room" />
        <MapCallout x={486} y={153} text="Room 14B-201" danger={active} />
        <MapCallout x={712} y={148} text="Office Area" />
        <MapCallout x={145} y={438} text="Main Entrance" />
      </g>

      {active && <g className="incident-card-map"><rect x="518" y="72" width="172" height="63" rx="7"/><IconSvgFlame x={536} y={88}/><text x="566" y="96">Fire Detected</text><text x="566" y="114">Room 14B-201</text><text x="566" y="128">Temp: 78°C · Smoke: High</text><path d="M602 135 545 182"/></g>}

      <g className="floor-ticks"><FloorTick y={102} label="15th Floor" active={floor === "15"}/><FloorTick y={179} label="14th Floor" active={floor === "14"}/><FloorTick y={256} label="13th Floor" active={floor === "13"}/><FloorTick y={333} label="Ground Floor" active={floor === "G"}/></g>
    </svg>
  </div>;
}

function FloorLayer({ y, label, active, incident = false, phase = 0 }: { y: number; label: string; active: boolean; incident?: boolean; phase?: number }) {
  return <g className={`floor-layer ${active ? "selected" : ""} ${incident ? "incident" : ""}`}>
    <path className="floor-side-front" d={`M168 ${y + 96} 512 ${y + 190} 813 ${y + 70} 813 ${y + 112} 512 ${y + 235} 168 ${y + 138}Z`} />
    <path className="floor-side-left" d={`M168 ${y + 20} 168 ${y + 138} 512 ${y + 235} 512 ${y + 114}Z`} />
    <path className="floor-top" d={`M168 ${y + 20} 512 ${y + 114} 813 ${y - 6} 466 ${y - 88}Z`} />
    <path className="floor-rim" d={`M168 ${y + 20} 512 ${y + 114} 813 ${y - 6} 466 ${y - 88}Z`} />
    <g className="rooms-grid">
      <path d={`M248 ${y + 42} 468 ${y - 25} 717 ${y + 36} 495 ${y + 117}Z`} />
      <path d={`M338 ${y + 66} 558 ${y - 2}`} />
      <path d={`M427 ${y + 90} 647 ${y + 23}`} />
      <path d={`M365 ${y + 6} 610 ${y + 66}`} />
      <path d={`M484 ${y - 30} 731 ${y + 31}`} />
      <path d={`M247 ${y + 42} 496 ${y + 117}`} />
      <path d={`M466 ${y - 25} 717 ${y + 36}`} />
    </g>
    <g className="room-windows">
      {Array.from({ length: 13 }, (_, i) => <rect key={i} x={220 + i * 42} y={y + 82 + (i % 2) * 4} width="10" height="18" />)}
      {Array.from({ length: 9 }, (_, i) => <rect key={`r-${i}`} x={566 + i * 25} y={y + 19 + (i % 2) * 5} width="9" height="17" />)}
    </g>
    {(active || incident) && <g className="floor-routes">
      <path className="route-main" d={`M216 ${y + 66} 342 ${y + 95} 443 ${y + 61} 572 ${y + 93} 735 ${y + 32}`} />
      <path className="route-secondary" d={`M394 ${y + 107} 438 ${y + 74} 490 ${y + 89} 612 ${y + 42}`} />
      <path className="exit-route" d={`M696 ${y + 43} 739 ${y + 30} 755 ${y + 37}`} />
      <path className="exit-route" d={`M255 ${y + 74} 221 ${y + 64} 205 ${y + 72}`} />
    </g>}
    {incident && <g className="sensor-points">
      <SensorDot x={428} y={y + 48} alert={phase >= 2} />
      <SensorDot x={514} y={y + 67} alert />
      <SensorDot x={616} y={y + 38} alert={phase >= 3} />
      <SensorDot x={312} y={y + 86} />
      <SensorDot x={707} y={y + 21} />
    </g>}
    <text className="floor-label" x="840" y={y + 38}>{label}</text>
  </g>;
}

function SensorDot({ x, y, alert = false }: { x: number; y: number; alert?: boolean }) {
  return <g className={alert ? "sensor-dot alert" : "sensor-dot"} transform={`translate(${x} ${y})`}><circle r="8"/><path d="M-3 0h6M0-3v6"/></g>;
}

function MapCallout({ x, y, text, danger = false }: { x: number; y: number; text: string; danger?: boolean }) {
  const width = Math.max(82, text.length * 7 + 18);
  return <g className={danger ? "map-callout danger" : "map-callout"} transform={`translate(${x} ${y})`}><rect width={width} height="27" rx="4"/><text x="10" y="18">{text}</text></g>;
}

function FloorTick({ y, label, active }: { y: number; label: string; active: boolean }) {
  return <g className={active ? "floor-tick active" : "floor-tick"}><path d={`M812 ${y}h42`} /><circle cx="812" cy={y} r="5"/><text x="862" y={y + 4}>{label}</text></g>;
}

function IconSvgFlame({ x, y }: { x: number; y: number }) {
  return <path className="svg-flame" transform={`translate(${x} ${y}) scale(.8)`} d="M12 22c4 0 7-3 7-7 0-5-4-8-7-13-1 4-5 6-5 11 0 2 1 3 2 4 0-3 2-5 3-7 1 3 3 4 3 7 0 2-1 4-3 5Z" />;
}

function IncidentDetails({ active, phase, openCamera }: { active: boolean; phase: number; openCamera: () => void }) {
  return <Panel title="Incident Details" className="incident-details">
    <span className={active ? "live-chip active" : "live-chip"}>{active ? "Live" : "Standby"}</span>
    <dl>
      <div><dt>Location</dt><dd>{active ? "Room 14B-201" : "None"}</dd></div>
      <div><dt>Floor</dt><dd>14th Floor</dd></div>
      <div><dt><Icon name="thermo" size={15} />Temperature</dt><dd className={active ? "danger-value" : ""}>{active ? `${phase >= 5 ? 89 : 78}°C` : "23°C"}</dd></div>
      <div><dt><Icon name="smoke" size={15} />Smoke Level</dt><dd>{active ? "High" : "Clear"}</dd></div>
      <div><dt>Detected At</dt><dd>{active ? "14:28 (2 min ago)" : "—"}</dd></div>
    </dl>
    <Button variant="danger" className="wide-action" onClick={openCamera}><Icon name="camera" size={16} />View Camera Feed</Button>
  </Panel>;
}

function SensorStatus({ phase }: { phase: number }) {
  const active = phase > 0 ? 3 : 0;
  const normal = phase > 0 ? 22 : 25;
  return <Panel title="Sensor Status" className="sensor-status">
    <div className="donut" style={{ ["--danger-count" as string]: `${active * 12}deg` }}><span>Total Sensors</span><strong>28</strong></div>
    <div className="sensor-breakdown"><span className="danger"><i/>Active <b>{active}</b></span><span className="safe"><i/>Normal <b>{normal}</b></span><span className="warning"><i/>Fault <b>3</b></span></div>
  </Panel>;
}

function EvacuationStatus({ phase }: { phase: number }) {
  const clear = phase < 6;
  return <Panel title="Evacuation Status" className="evac-status">
    <div className="evac-hero"><Icon name="run" size={34} /><div><span>Evacuation Route</span><strong>{clear ? "Clear" : "Rerouted"}</strong></div></div>
    <div className="progress"><i style={{ width: clear ? "100%" : "74%" }} /></div>
    <StatusLine icon="exit" label="Available Exits" value={clear ? "4 / 4" : "3 / 4"} tone="safe" />
    <StatusLine icon="extinguisher" label="Fire Extinguishers" value="6 / 8" tone="danger" />
    <StatusLine icon="hydrant" label="Fire Hydrants" value="3 / 4" tone="info" />
  </Panel>;
}

function StatusLine({ icon, label, value, tone }: { icon: IconName; label: string; value: string; tone: "safe" | "danger" | "info" }) {
  return <div className={`status-line ${tone}`}><Icon name={icon} size={17} /><span>{label}</span><b>{value}</b></div>;
}

function MiniMap({ floor, setFloor, phase }: { floor: FloorId; setFloor: (value: FloorId) => void; phase: number }) {
  return <Panel title="Mini Map" className="mini-map-panel">
    <svg viewBox="0 0 210 150" role="img" aria-label="Miniature building floor selector">
      <defs><linearGradient id="miniGlass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--map-glass-high)"/><stop offset="1" stopColor="var(--map-glass-low)"/></linearGradient></defs>
      {[94, 68, 42, 16].map((y, index) => <g key={y} className={index === 1 && phase > 0 ? "mini-floor incident" : "mini-floor"}><path d={`M25 ${y} 103 ${y + 24} 183 ${y - 6} 105 ${y - 28}Z`} /><path d={`M55 ${y + 9} 104 ${y + 23} 153 ${y + 5}`} /></g>)}
      {phase > 0 && <path className="mini-hot" d="M87 49 136 63 119 78 70 63Z" />}
      <path className="mini-route" d="M51 91 86 101 127 82 166 69" />
    </svg>
    <div className="mini-buttons">{floors.map((item) => <button key={item.id} className={floor === item.id ? "active" : ""} onClick={() => setFloor(item.id)}>{item.id === "G" ? "GF" : item.id}</button>)}</div>
  </Panel>;
}

function LiveCamera({ phase, open, openCamera, closeCamera }: { phase: number; open: boolean; openCamera: () => void; closeCamera: () => void }) {
  const active = phase > 0;
  return <Panel className={`live-camera ${open ? "expanded" : ""}`}>
    <div className="mini-head"><span><i/>Live Camera</span><button onClick={open ? closeCamera : openCamera}>{open ? "Close" : "View All"}</button></div>
    <div className="camera-thumb">
      <svg viewBox="0 0 300 130" role="img" aria-label="Live indoor camera feed">
        <rect width="300" height="130" className="cam-bg" />
        <path className="cam-ceiling" d="M0 0h300l-82 51H82Z" />
        <path className="cam-floor" d="M0 130h300l-82-79H82Z" />
        <g className="cam-doors"><rect x="13" y="30" width="45" height="73"/><rect x="232" y="28" width="47" height="75"/><rect x="106" y="39" width="31" height="50"/></g>
        <path className="cam-grid" d="M0 130 150 51 300 130M82 51 0 0M218 51 300 0" />
        {active && <g><ellipse className="cam-fire-glow" cx="155" cy="83" rx="54" ry="42"/><path className="cam-fire" d="M154 103c-25-10-20-38-5-50 2 14 10 17 11 28 6-11 7-25 1-38 26 22 34 52 11 63-7 4-12 1-18-3Z"/><rect className="cam-detect" x="109" y="42" width="82" height="67"/><text x="119" y="36">Fire Detected</text></g>}
      </svg>
      <span className="room-tag">Room 14B-201</span><time>14:28</time>
    </div>
  </Panel>;
}

function RecentAlerts({ phase }: { phase: number }) {
  const alerts = useMemo(() => [
    { icon: "flame" as IconName, tone: "danger", text: phase > 0 ? "Fire Detected — Room 14B-201" : "System Armed — Floor 14", time: "14:28" },
    { icon: "smoke" as IconName, tone: "warning", text: "Smoke Detected — Corridor 14B", time: "14:24" },
    { icon: "sensor" as IconName, tone: "muted", text: "Sensor Offline — Room 13A-105", time: "13:50" },
    { icon: "check" as IconName, tone: "safe", text: "System Check Complete", time: "12:01" },
  ], [phase]);
  return <Panel className="recent-alerts"><div className="mini-head"><span><i/>Recent Alerts</span><button>View All</button></div>{alerts.map((alert) => <div className={`alert-row ${alert.tone}`} key={alert.text}><Icon name={alert.icon} size={16}/><span>{alert.text}</span><time>{alert.time}</time></div>)}</Panel>;
}

function BuildingOverview({ phase }: { phase: number }) {
  return <Panel className="overview-panel"><div className="mini-head"><span><Icon name="building" size={15}/>Building Overview</span></div><div className="overview-stats"><div><small>Total Floors</small><strong>4</strong></div><div><small>Total Rooms</small><strong>48</strong></div><div><small>Total Sensors</small><strong>28</strong></div></div><div className="overview-bottom"><span><Icon name="flame" size={22}/>Active Incidents <b>{phase > 0 ? 1 : 0}</b></span><span><Icon name="run" size={25}/>Evacuation Status <b>{phase >= 6 ? "Reroute" : "Clear"}</b></span></div></Panel>;
}

function SimulationControls({ running, phase, simulate, reset }: { running: boolean; phase: number; simulate: () => void; reset: () => void }) {
  return <Panel className="sim-control"><div className="mini-head"><span><Icon name="warning" size={15}/>Simulation</span></div><div className="phase-meter"><span style={{ width: `${Math.max(8, phase * 14)}%` }} /></div><p>{running ? "Incident sequence running" : phase > 0 ? "Incident response active" : "Ready for scenario"}</p><div className="sim-buttons"><Button variant="danger" onClick={simulate} disabled={running}><Icon name="play" size={15}/>{running ? "Running" : "Simulate"}</Button><Button onClick={reset}><Icon name="reset" size={15}/>Reset</Button></div></Panel>;
}

function DetailWorkspace({ view, phase }: { view: Exclude<ViewId, "map">; phase: number }) {
  const title = view === "alerts" ? "Live Alert Queue" : view === "analytics" ? "Incident Analytics" : "Response Reports";
  return <Panel className="detail-workspace"><div className="detail-title"><Icon name={view === "alerts" ? "bell" : view === "analytics" ? "chart" : "report"} size={22}/><div><h2>{title}</h2><p>{view === "alerts" ? "Active event stream from building safety systems." : view === "analytics" ? "Sensor trends and model confidence for the current incident." : "Generated command record for operations teams."}</p></div></div>{view === "alerts" ? <AlertMatrix phase={phase}/> : view === "analytics" ? <AnalyticsMatrix phase={phase}/> : <ReportMatrix phase={phase}/>}</Panel>;
}

function AlertMatrix({ phase }: { phase: number }) {
  return <div className="detail-grid">{["Fire signature confirmed", "Smoke density rising", "East corridor crowding", "Responder route prepared", "Elevator core locked", "Medical unit notified"].map((item, index) => <div className={index < phase ? "detail-item active" : "detail-item"} key={item}><Icon name={index === 0 ? "flame" : index === 1 ? "smoke" : index === 2 ? "run" : index === 3 ? "route" : index === 4 ? "shield" : "bell"} size={20}/><strong>{item}</strong><span>{index < phase ? "Confirmed" : "Queued"}</span></div>)}</div>;
}

function AnalyticsMatrix({ phase }: { phase: number }) {
  const values = [["Detection Confidence", phase > 0 ? 96 : 11], ["Spread Risk", phase > 2 ? 82 : 18], ["Occupancy Certainty", phase > 4 ? 91 : 34], ["Route Safety", phase > 5 ? 74 : 99]];
  return <div className="analytics-list">{values.map(([label, value]) => <div className="analytics-row" key={label}><div><span>{label}</span><strong>{value}%</strong></div><i><b style={{ width: `${value}%` }} /></i></div>)}</div>;
}

function ReportMatrix({ phase }: { phase: number }) {
  return <div className="report-sheet"><h3>Incident RQ-2291</h3><p>AI detected a fire signature in Room 14B-201 and prepared rescue routing for occupants and responders.</p><dl><div><dt>Status</dt><dd>{phase >= 7 ? "Units dispatched" : phase > 0 ? "In progress" : "Draft"}</dd></div><div><dt>Affected zones</dt><dd>14B-201, east corridor, open office</dd></div><div><dt>Recommended action</dt><dd>Evacuate west stairwell and route responders through main entrance.</dd></div></dl></div>;
}