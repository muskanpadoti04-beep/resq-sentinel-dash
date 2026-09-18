import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESQ AI — Indoor Fire Command Dashboard" },
      { name: "description", content: "Interactive indoor fire detection, risk prediction, evacuation routing, and rescue dispatch command dashboard." },
      { property: "og:title", content: "RESQ AI — Indoor Fire Command Dashboard" },
      { property: "og:description", content: "A live simulation of AI-assisted indoor fire detection, spread prediction, and rescue coordination." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Tab = "detection" | "risk" | "rescue" | "flow";
type AgencyState = "standby" | "sending" | "dispatched";

const FLOW_STEPS = [
  ["Alert Trigger", "Visual + thermal anomaly"],
  ["Edge Validation", "Confidence above threshold"],
  ["Cloud Confirmation", "3 sensors agree"],
  ["Risk Assessment", "Spread model calculated"],
  ["Hub Notification", "Incident package received"],
  ["Route Planning", "Safe paths generated"],
  ["Dispatch & Execution", "All agencies notified"],
] as const;

const TABS: { id: Tab; label: string; code: string }[] = [
  { id: "detection", label: "Live Detection", code: "M01" },
  { id: "risk", label: "Risk Prediction", code: "M02" },
  { id: "rescue", label: "Rescue Command", code: "M03" },
  { id: "flow", label: "System Flow", code: "FLOW" },
];

const Icon = ({ name, size = 18 }: { name: "play" | "reset" | "flame" | "camera" | "people" | "route" | "shield" | "stairs" | "bell"; size?: number }) => {
  const paths: Record<string, ReactNode> = {
    play: <path d="m8 5 11 7-11 7V5Z" />,
    reset: <><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/></>,
    flame: <path d="M12 22c4 0 7-3 7-7 0-5-4-8-7-13-1 4-5 6-5 11 0 2 1 3 2 4 0-3 2-5 3-7 1 3 3 4 3 7 0 2-1 4-3 5Z" />,
    camera: <><path d="M14.5 6 13 4H7L5.5 6H3v13h18V6h-6.5Z"/><circle cx="12" cy="12.5" r="4"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 7a3 3 0 0 1 0 6M19 20v-2a5 5 0 0 0-3-4.6"/></>,
    route: <><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/><path d="M7 19h4a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    stairs: <path d="M3 19h5v-4h4v-4h4V7h5" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

function Button({ children, variant = "secondary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>;
}

function Dashboard() {
  const [tab, setTab] = useState<Tab>("risk");
  const [floor, setFloor] = useState(14);
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(false);
  const [thermal, setThermal] = useState(false);
  const [showVictims, setShowVictims] = useState(true);
  const [time, setTime] = useState<Date | null>(null);
  const [agency, setAgency] = useState<AgencyState>("standby");
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
    setFloor(14); setPhase(0); setRunning(true); setAgency("standby"); setTab("detection");
    const schedule = [
      [600, 1, "detection"], [1800, 2, "detection"], [3200, 3, "risk"],
      [4800, 4, "risk"], [6400, 5, "risk"], [8100, 6, "rescue"],
      [10000, 7, "rescue"], [11800, 8, "rescue"], [13500, 9, "flow"],
    ] as const;
    schedule.forEach(([delay, next, nextTab]) => timers.current.push(window.setTimeout(() => {
      setPhase(next); setTab(nextTab);
      if (next === 8) setAgency("dispatched");
      if (next === 9) setRunning(false);
    }, delay)));
  };

  const reset = () => {
    clearTimers(); setPhase(0); setRunning(false); setAgency("standby"); setTab("risk");
  };

  const dispatch = () => {
    setAgency("sending");
    timers.current.push(window.setTimeout(() => setAgency("dispatched"), 1100));
  };

  const step = Math.min(7, phase);
  const timestamp = time?.toLocaleTimeString("en-GB", { hour12: false }) ?? "--:--:--";
  const incidentActive = floor === 14 && phase > 0;

  return (
    <main className="app-shell">
      <header className="command-header">
        <div className="brand-lockup">
          <div className="brand-mark"><Icon name="shield" size={21}/><span className="signal-dot" /></div>
          <div><div className="brand-name">RESQ <strong>AI</strong></div><div className="brand-sub">INCIDENT INTELLIGENCE SYSTEM</div></div>
        </div>
        <div className="building-status">
          <span className={`status-beacon ${incidentActive ? "alarm" : ""}`} />
          <div><span>BUILDING 07 · NORTH TOWER</span><strong>{incidentActive ? "ACTIVE INCIDENT" : "SYSTEM NORMAL"}</strong></div>
        </div>
        <div className="header-controls">
          <label className="floor-select">FLOOR<select value={floor} onChange={(event) => setFloor(Number(event.target.value))}><option>13</option><option>14</option><option>15</option></select></label>
          <time>{timestamp}<small>UTC+05:30</small></time>
          <Button variant="primary" onClick={simulate} disabled={running}><Icon name="play" size={15}/>{running ? "SIMULATION ACTIVE" : "SIMULATE FIRE INCIDENT"}</Button>
          <Button onClick={reset} aria-label="Reset simulation" title="Reset simulation"><Icon name="reset" size={17}/></Button>
        </div>
      </header>

      <nav className="module-tabs" aria-label="Dashboard modules">
        {TABS.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><small>{item.code}</small>{item.label}{item.id === "detection" && <span className="live-pill">LIVE</span>}</button>)}
        <div className="golden-minute"><span>GOLDEN MINUTE</span><strong>{phase ? `${String(Math.min(59, phase * 7)).padStart(2,"0")}.0s` : "READY"}</strong></div>
      </nav>

      <section className="workspace">
        {floor !== 14 ? <FloorStandby floor={floor} /> : tab === "detection" ? <DetectionView phase={phase} thermal={thermal} setThermal={setThermal} timestamp={timestamp} /> : tab === "risk" ? <RiskView phase={phase} /> : tab === "rescue" ? <RescueView phase={phase} showVictims={showVictims} setShowVictims={setShowVictims} agency={agency} dispatch={dispatch} /> : <FlowView phase={phase} timestamp={timestamp} />}
      </section>

      <footer className="system-footer"><span><i className="ok-dot"/>AI CORE ONLINE</span><span>EDGE NODES 24/24</span><span>CAMERAS 86/86</span><span>SENSORS 142/144</span><span className="footer-right">AES-256 · SECURE CHANNEL</span></footer>
    </main>
  );
}

function SectionHead({ code, title, meta }: { code: string; title: string; meta?: string }) {
  return <div className="section-head"><div><small>{code}</small><h2>{title}</h2></div>{meta && <span>{meta}</span>}</div>;
}

function DetectionView({ phase, thermal, setThermal, timestamp }: { phase: number; thermal: boolean; setThermal: (value: boolean) => void; timestamp: string }) {
  const detection = phase >= 1;
  const confirmed = phase >= 2;
  return <div className="detection-layout animate-fade-in">
    <section className="panel camera-panel">
      <SectionHead code="CAMERA FEED / 14B" title="Corridor · Floor 14" meta="CAM 14B · ONLINE" />
      <div className={`camera-feed ${thermal ? "thermal" : ""}`}>
        <svg viewBox="0 0 900 510" role="img" aria-label="Simulated corridor camera view with fire detection">
          <defs><linearGradient id="hall" x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--feed-ceiling)"/><stop offset="1" stopColor="var(--feed-floor)"/></linearGradient><radialGradient id="heat"><stop stopColor="var(--heat-core)"/><stop offset=".45" stopColor="var(--hazard)"/><stop offset="1" stopColor="transparent"/></radialGradient></defs>
          <rect width="900" height="510" fill="url(#hall)"/><path d="M0 0h900L650 205H250Z" fill="var(--feed-ceiling)"/><path d="M0 510h900L650 205H250Z" fill="var(--feed-floor)"/>
          <path d="M0 0v510l250-305V0M900 0v510L650 205V0" fill="var(--feed-wall)" stroke="var(--line)"/>
          <g fill="var(--feed-door)" stroke="var(--line)"><path d="M60 86h125v294H60z"/><path d="M715 76h132v314H715z"/><path d="M282 112h80v170h-80z"/><path d="M552 112h72v170h-72z"/></g>
          <g stroke="var(--line-soft)" strokeWidth="2"><path d="M0 510 450 205 900 510M250 205 0 0M650 205 900 0"/><path d="M360 510 420 205M540 510 480 205"/></g>
          {detection && <g className="fire-visual"><ellipse cx="596" cy="333" rx="110" ry="96" fill="url(#heat)"/><path d="M598 383c-40-18-42-65-10-91-1 24 13 27 14 45 6-19 22-31 14-63 41 38 58 92 14 116-12 7-24 8-32 3Z" fill="var(--hazard)"/><path d="M605 374c-16-11-16-33 1-48 1 14 9 20 10 29 7-10 9-19 6-29 19 22 17 43-1 52-6 3-11 2-16-4Z" fill="var(--warning)"/></g>}
          {detection && <g className="smoke-visual" fill="var(--smoke)"><circle cx="604" cy="255" r="42"/><circle cx="572" cy="225" r="35"/><circle cx="624" cy="196" r="48"/><circle cx="584" cy="158" r="45"/></g>}
          {detection && <g className="detect-box"><rect x="520" y="240" width="164" height="168"/><path d="M520 266v-26h27M684 266v-26h-27M520 382v26h27M684 382v26h-27"/></g>}
        </svg>
        <div className="feed-top"><span className="rec"><i/>REC</span><span>{timestamp} · 24 FPS</span></div>
        <div className="feed-label">CAM 14B — CORRIDOR, FLOOR 14</div>
        {detection && <div className="confidence-stack"><span>FIRE <strong>0.94</strong></span><span>SMOKE <strong>0.88</strong></span></div>}
        {thermal && <div className="temp-chip">PEAK TEMP <strong>480°C</strong></div>}
        <div className="scanline" />
      </div>
      <div className="feed-controls"><label className="switch-row"><input type="checkbox" checked={thermal} onChange={(event) => setThermal(event.target.checked)}/><span className="switch"/><span>THERMAL FUSION</span></label><span className="sensor-read">IR SENSOR <b>{thermal ? "ACTIVE" : "STANDBY"}</b></span></div>
    </section>
    <aside className="side-stack">
      <section className="panel detection-score"><SectionHead code="AI INFERENCE" title="Detection Matrix" />
        {[ ["FIRE", detection ? 94 : 4], ["SMOKE", detection ? 88 : 7], ["THERMAL", confirmed ? 97 : 11], ["GAS / VOC", confirmed ? 79 : 8] ].map(([name, value]) => <div className="metric" key={name}><div><span>{name}</span><strong>{Number(value).toFixed(0)}%</strong></div><div className="bar"><i style={{ width: `${value}%` }}/></div></div>)}
        <div className={`validation ${confirmed ? "confirmed" : ""}`}><Icon name="shield"/><div><small>CROSS-SENSOR STATUS</small><strong>{confirmed ? "THREAT CONFIRMED" : "MONITORING"}</strong></div></div>
      </section>
      <section className="panel event-log"><SectionHead code="EVENT STREAM" title="Detection Log" />
        <Log time={timestamp} active={phase >= 2} tone="danger" text="Thermal signature confirmed — Zone B2" />
        <Log time={timestamp} active={phase >= 1} tone="warning" text="Smoke detected — Zone B2" />
        <Log time="14:31:58" active tone="neutral" text="Motion anomaly — Corridor 14B" />
        <Log time="14:31:42" active tone="neutral" text="Environmental sensors nominal" />
      </section>
    </aside>
  </div>;
}

function Log({ time, text, active, tone }: { time: string; text: string; active: boolean; tone: string }) {
  if (!active) return null;
  return <div className={`log-item ${tone}`}><time>{time}</time><i/><span>{text}</span></div>;
}

function RiskView({ phase }: { phase: number }) {
  const [manualStage, setManualStage] = useState<number | null>(null);
  const stage = manualStage ?? (phase >= 7 ? 3 : phase >= 5 ? 2 : phase >= 4 ? 1 : 0);
  return <div className="risk-layout animate-fade-in">
    <section className="panel plan-panel"><SectionHead code="SPATIAL INTELLIGENCE / FLOOR 14" title="Predicted Fire Spread" meta="MODEL CONFIDENCE 91.6%"/><FloorPlan stage={stage} mode="risk" />
      <div className="time-selector">{["CURRENT", "T + 2 MIN", "T + 5 MIN", "T + 10 MIN"].map((label, index) => <button className={stage === index ? "active" : ""} onClick={() => setManualStage(index)} key={label}><i/>{label}</button>)}</div>
    </section>
    <aside className="side-stack"><RiskScore active={phase >= 3}/><HazardLegend/><Environment phase={phase}/></aside>
  </div>;
}

function RescueView({ phase, showVictims, setShowVictims, agency, dispatch }: { phase: number; showVictims: boolean; setShowVictims: (value:boolean)=>void; agency: AgencyState; dispatch:()=>void }) {
  const blocked = phase >= 7;
  return <div className="rescue-layout animate-fade-in">
    <section className="panel plan-panel"><SectionHead code="TACTICAL OVERLAY / FLOOR 14" title="Live Rescue Routing" meta={blocked ? "ROUTE RECALCULATED · 0.3s" : "ROUTES SYNCHRONIZED"}/><FloorPlan stage={phase >= 7 ? 3 : 2} mode="rescue" showVictims={showVictims} blocked={blocked}/>
      <div className="map-legend"><span className="safe-line">Occupant egress</span><span className="ingress-line">Responder ingress</span><span><i className="victim-dot"/>Victim / occupant</span><label className="switch-row"><input type="checkbox" checked={showVictims} onChange={(event)=>setShowVictims(event.target.checked)}/><span className="switch"/>SHOW VICTIMS</label></div>
    </section>
    <aside className="side-stack"><IncidentCard blocked={blocked}/><DispatchPanel state={agency} dispatch={dispatch}/></aside>
  </div>;
}

const rooms = [
  { id:"A1", x:35,y:35,w:150,h:122 }, { id:"A2", x:185,y:35,w:155,h:122 }, { id:"B1", x:35,y:235,w:150,h:125 }, { id:"B2", x:185,y:235,w:155,h:125 },
  { id:"C1", x:480,y:35,w:150,h:122 }, { id:"C2", x:630,y:35,w:155,h:122 }, { id:"C3", x:480,y:235,w:150,h:125 }, { id:"D1", x:630,y:235,w:155,h:125 },
];

function FloorPlan({ stage, mode, showVictims = false, blocked = false }: { stage:number; mode:"risk"|"rescue"; showVictims?:boolean; blocked?:boolean }) {
  const hazard = (id:string) => id === "B2" ? "origin" : stage >= 3 && ["A2","B1","C3"].includes(id) ? "critical" : stage >= 2 && ["A1","C1","C3"].includes(id) ? "hot" : stage >= 1 && ["B1","C1"].includes(id) ? "warm" : "clear";
  return <div className={`floor-plan stage-${stage}`}>
    <svg viewBox="0 0 820 400" role="img" aria-label="Floor 14 indoor floor plan showing rooms, fire spread and rescue routes">
      <defs><pattern id="microgrid" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0v12" fill="none" stroke="var(--grid-line)" strokeWidth=".5"/></pattern><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <rect x="20" y="20" width="780" height="360" rx="2" fill="url(#microgrid)" stroke="var(--plan-wall)" strokeWidth="3"/>
      <rect x="340" y="20" width="140" height="360" className="corridor"/><path d="M20 195h780" className="corridor-line"/>
      {rooms.map((room) => <g key={room.id} className={`room hazard-${hazard(room.id)}`}><rect x={room.x} y={room.y} width={room.w} height={room.h}/><text x={room.x+14} y={room.y+24}>{room.id}</text><text className="room-name" x={room.x+14} y={room.y+43}>{room.id === "B2" ? "SERVER / ELEC" : room.id === "C1" ? "OPEN OFFICE" : room.id === "C3" ? "MEETING" : "OFFICE"}</text>{room.id === "B2" && <g className="origin-mark" transform="translate(262 300)"><circle r="28"/><text textAnchor="middle" y="5">FIRE</text></g>}</g>)}
      <g className="core"><rect x="365" y="45" width="90" height="80"/><text x="410" y="77" textAnchor="middle">ELEVATOR</text><text x="410" y="96" textAnchor="middle">CORE</text><path d="m395 110 15-14 15 14"/></g>
      <g className="exit"><rect x="365" y="275" width="90" height="78"/><text x="410" y="300" textAnchor="middle">STAIR B</text><path d="M380 335h15v-9h14v-9h14v-9h16"/></g>
      <g className="exit"><rect x="35" y="165" width="92" height="60"/><text x="81" y="190" textAnchor="middle">STAIR A</text><path d="M50 213h14v-8h14v-8h14v-8h18"/></g>
      <g className="exit"><rect x="693" y="165" width="92" height="60"/><text x="739" y="190" textAnchor="middle">EXIT 14E</text><path d="M712 211h52m-12-10 12 10-12 10"/></g>
      <g className="doors"><path d="M160 157v20M310 157v20M510 157v20M660 157v20M160 215v20M310 215v20M510 215v20M660 215v20"/></g>
      {stage >= 2 && <g className="smoke-path"><path d="M265 296C335 250 342 215 408 211S526 199 570 266"/><path d="M270 290C335 320 375 339 411 340"/></g>}
      {mode === "rescue" && <>
        {showVictims && <g className="victims" filter="url(#glow)"><Victim x={252} y={274} label="V1"/><Victim x={550} y={99} label="V2"/><Victim x={553} y={300} label="V3"/></g>}
        <g className="routes"><path className="route safe" d={blocked ? "M252 274 L310 214 L350 195 L140 195 L82 195" : "M252 274 L350 195 L140 195 L82 195"}/><path className="route safe delay" d="M550 99 L510 170 L650 195 L739 195"/><path className="route safe delay-2" d={blocked ? "M553 300 L510 340 L410 340 L410 315" : "M553 300 L650 215 L739 195"}/><path className="route ingress" d={blocked ? "M82 195 L145 195 L165 218 L175 300 L225 300" : "M82 195 L350 195 L310 274 L265 300"}/></g>
        {blocked && <g className="blockage"><path d="m350 178 28 34m0-34-28 34"/><text x="364" y="165" textAnchor="middle">BLOCKED</text></g>}
      </>}
      <text x="30" y="394" className="scale-label">0m</text><path d="M55 389h80" className="scale"/><text x="142" y="394" className="scale-label">10m</text>
    </svg>
    <div className="north-arrow">N<span>↑</span></div>
    {stage > 0 && <div className="map-alert"><Icon name="flame" size={15}/><span>ORIGIN</span><strong>ZONE 14-B / B2</strong></div>}
  </div>;
}

function Victim({x,y,label}:{x:number;y:number;label:string}) { return <g transform={`translate(${x} ${y})`}><circle r="8"/><circle r="14" className="victim-ring"/><text x="17" y="4">{label}</text></g>; }

function RiskScore({active}:{active:boolean}) { const score=active?82:12; return <section className="panel risk-score"><SectionHead code="COMPOSITE INDEX" title="Structural Risk"/><div className="gauge"><svg viewBox="0 0 180 105"><path d="M20 92a70 70 0 0 1 140 0"/><path className="gauge-value" style={{strokeDasharray:`${score*2.2} 220`}} d="M20 92a70 70 0 0 1 140 0"/></svg><div><strong>{score}</strong><span>/100</span><b>{active?"HIGH":"LOW"}</b></div></div>{[["MATERIAL FLAMMABILITY",92],["OCCUPANCY DENSITY",76],["VENTILATION RISK",81]].map(([label,value])=><div className="metric compact" key={label}><div><span>{label}</span><strong>{active?value:10}%</strong></div><div className="bar"><i style={{width:`${active?value:10}%`}}/></div></div>)}</section>; }

function HazardLegend(){return <section className="panel legend-panel"><SectionHead code="PREDICTION KEY" title="Hazard States"/><div className="legend-grid"><span><i className="legend-clear"/>Unaffected</span><span><i className="legend-warm"/>Elevated</span><span><i className="legend-hot"/>High risk</span><span><i className="legend-critical"/>Critical</span></div></section>}

function Environment({phase}:{phase:number}){return <section className="panel env-panel"><SectionHead code="IOT SENSOR FUSION" title="Environment"/><div className="env-grid"><div><small>TEMP</small><strong>{phase>=2?"74.8":"23.1"}°C</strong></div><div><small>SMOKE</small><strong>{phase>=2?"186":"04"}<em> ppm</em></strong></div><div><small>AIRFLOW</small><strong>2.4<em> m/s</em></strong></div><div><small>O₂</small><strong>{phase>=2?"18.2":"20.8"}<em>%</em></strong></div></div></section>}

function IncidentCard({blocked}:{blocked:boolean}) { return <section className="panel incident-card"><div className="incident-top"><span>ACTIVE INCIDENT</span><i/></div><h3>#RQ-2291</h3><div className="incident-grid"><div><small>SEVERITY</small><strong className="danger-text">HIGH</strong></div><div><small>UNIT ETA</small><strong>03:40</strong></div><div><small>VICTIMS</small><strong>03</strong></div><div><small>ZONES</small><strong>B2, C1, C3</strong></div></div>{blocked && <div className="reroute-alert"><Icon name="route"/><div><strong>ROUTE RECALCULATED</strong><span>East corridor compromised · alternate paths active</span></div></div>}</section> }

function DispatchPanel({state,dispatch}:{state:AgencyState;dispatch:()=>void}) { const agencies=[["FIRE","Engine 12 · Ladder 4"],["MEDICAL","Medic 07 · Trauma Unit"],["SECURITY","Building response team"]]; return <section className="panel dispatch-panel"><SectionHead code="MULTI-AGENCY ALERT" title="Dispatch Control"/>{agencies.map(([name,unit],i)=><div className="agency" key={name}><div className="agency-icon"><Icon name={i===0?"flame":i===1?"people":"shield"}/></div><div><strong>{name}</strong><span>{unit}</span></div><b className={state}>{state === "standby" ? "READY" : state === "sending" ? "SENDING…" : "DISPATCHED"}</b></div>)}<Button variant="danger" className="dispatch-button" onClick={dispatch} disabled={state!=="standby"}><Icon name="bell"/>{state === "standby" ? "DISPATCH NOW" : state === "sending" ? "TRANSMITTING ALERTS" : "ALL UNITS DISPATCHED"}</Button></section> }

function FlowView({phase,timestamp}:{phase:number;timestamp:string}) { const active=Math.min(7,phase); return <div className="flow-view animate-fade-in"><section className="panel flow-panel"><SectionHead code="END-TO-END RESPONSE PIPELINE" title="The Golden Minute" meta={active===7?"SEQUENCE COMPLETE":active?"INCIDENT IN PROGRESS":"AWAITING TRIGGER"}/><div className="flow-time"><small>DETECTION TO DISPATCH</small><strong>{active?`${String(active*7).padStart(2,"0")}.0`:"00.0"}<em>SEC</em></strong><p>Every signal becomes an actionable rescue decision.</p></div><div className="flow-track">{FLOW_STEPS.map(([title,desc],index)=>{const state=index<active?"complete":index===active?"current":"pending";return <div className={`flow-step ${state}`} key={title}><div className="step-node"><span>{index<active?"✓":String(index+1).padStart(2,"0")}</span></div><div className="step-copy"><small>{index<2?"DETECTION LAYER":index<4?"AI ENGINE":"COMMAND CENTER"}</small><h3>{title}</h3><p>{desc}</p><time>{index<active?timestamp:"— — : — — : — —"}</time></div></div>})}</div></section></div> }

function FloorStandby({floor}:{floor:number}) { return <section className="panel floor-standby"><div className="standby-icon"><Icon name="shield" size={34}/></div><small>FLOOR {floor} · MONITORING</small><h2>No active incident on this floor</h2><p>All detection, environmental, and access-control systems report nominal conditions.</p><div className="standby-stats"><span>24<small>CAMERAS ONLINE</small></span><span>38<small>SENSORS NOMINAL</small></span><span>02<small>EGRESS PATHS CLEAR</small></span></div></section> }