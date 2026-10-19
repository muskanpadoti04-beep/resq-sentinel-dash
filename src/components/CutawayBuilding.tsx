import type { KeyboardEvent } from "react";

type FloorId = "15" | "14" | "13" | "G";
type Layer = "occupants" | "fire" | "heatmap" | "routes" | "blocked" | "sensors" | "cameras";
type Person = { id: string; floor: FloorId; room: string; status: string };
type Props = {
  floor: FloorId;
  phase: number;
  layers: Record<Layer, boolean>;
  navigating: boolean;
  occupants: Person[];
  setFloor: (floor: FloorId) => void;
  openRoom: (id: string) => void;
};

const levels: { id: FloorId; base: number; name: string; use: string; rooms: string[] }[] = [
  { id: "G", base: 505, name: "Ground Floor", use: "Reception & Support", rooms: ["Lobby", "Security", "Support", "Reception"] },
  { id: "13", base: 400, name: "13th Floor", use: "Meeting Rooms", rooms: ["13A-105", "13C-010", "Meeting 01", "Meeting 02"] },
  { id: "14", base: 295, name: "14th Floor", use: "Offices · Server Room", rooms: ["14B-204", "14B-201", "14B-202", "14B-203"] },
  { id: "15", base: 190, name: "15th Floor", use: "R&D Lab", rooms: ["15A-102", "15A-104", "Research Lab", "Testing Lab"] },
];

// One projection keeps walls, furniture, stairs and route overlays spatially aligned.
function point(u: number, v: number, base: number, height = 0) {
  return [185 + u * 1.08 + v * .64, base + u * .235 - v * .37 - height];
}
function polygon(coords: number[][], base: number) {
  return coords.map(([u = 0, v = 0, h = 0]) => point(u, v, base, h).join(",")).join(" ");
}
function box(u: number, v: number, w: number, d: number, base: number, height = 0) {
  return polygon([[u, v, height], [u + w, v, height], [u + w, v + d, height], [u, v + d, height]], base);
}
function activate(event: KeyboardEvent<SVGGElement>, callback: () => void) {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); callback(); }
}

function Furniture({ u, v, base, server, meeting }: { u: number; v: number; base: number; server?: boolean; meeting?: boolean }) {
  if (server) return <g className="cut-server-racks">{[0, 1, 2].map(i => <g key={i}>
    <polygon className="cut-rack-front" points={polygon([[u + i * 28, v, 0], [u + 20 + i * 28, v, 0], [u + 20 + i * 28, v, 38], [u + i * 28, v, 38]], base)} />
    <polygon className="cut-rack-side" points={polygon([[u + 20 + i * 28, v, 0], [u + 20 + i * 28, v + 24, 0], [u + 20 + i * 28, v + 24, 38], [u + 20 + i * 28, v, 38]], base)} />
    <polygon className="cut-desk" points={box(u + i * 28, v, 20, 24, base, 38)} />
    {[10, 20, 30].map(h => { const [x, y] = point(u + 5 + i * 28, v, base, h); return <path key={h} className="cut-rack-light" d={`M${x} ${y}l10 2.3`} />; })}
  </g>)}</g>;
  return <g className="cut-furniture">{(meeting ? [0] : [0, 1]).map(i => {
    const a = u + i * 47;
    return <g key={i}>
      <polygon className="cut-desk" points={box(a, v, meeting ? 76 : 32, 25, base, 14)} />
      <path className="cut-desk-leg" d={`M${point(a + 3, v + 3, base, 14)}L${point(a + 3, v + 3, base)}M${point(a + (meeting ? 70 : 28), v + 3, base, 14)}L${point(a + (meeting ? 70 : 28), v + 3, base)}`} />
      {!meeting && <polygon className="cut-monitor" points={polygon([[a + 8, v + 17, 14], [a + 23, v + 17, 14], [a + 23, v + 17, 27], [a + 8, v + 17, 27]], base)} />}
      <polygon className="cut-chair" points={box(a + 8, v - 12, 13, 12, base, 8)} />
      {meeting && <polygon className="cut-chair" points={box(a + 49, v - 12, 13, 12, base, 8)} />}
    </g>;
  })}</g>;
}

export function CutawayBuilding({ floor, phase, layers, navigating, occupants, setFloor, openRoom }: Props) {
  const incident = phase > 0;
  return <div className="cutaway-scene">
    <svg className="cutaway-svg" viewBox="0 0 930 720" aria-label="Interactive multi-floor cutaway building">
      <defs>
        <linearGradient id="cut-glass" x2="0" y2="1"><stop stopColor="var(--map-glass-high)" /><stop offset="1" stopColor="var(--map-glass-low)" /></linearGradient>
        <radialGradient id="cut-fire-glow"><stop stopColor="var(--fire-core)" stopOpacity=".8" /><stop offset=".4" stopColor="var(--hazard)" stopOpacity=".55" /><stop offset="1" stopColor="var(--hazard)" stopOpacity="0" /></radialGradient>
      </defs>
      <polygon className="cut-site" points="80,568 354,677 879,511 611,398" />
      <path className="cut-road" d="M55 622 350 712 907 552" />
      <g className="cut-landscape">{[ [145, 560], [112, 580], [736, 578], [800, 556], [848, 537] ].map(([x = 0, y = 0], i) => <g key={i}><path d={`M${x} ${y}v-20`} /><path d={`M${x - 11} ${y - 15}l11-28 11 28Z`} /></g>)}</g>
      <g className="cut-foundation"><polygon points={box(0, 0, 460, 220, 525)} /></g>
      {levels.map(level => {
        const selected = level.id === floor;
        const burning = level.id === "14" && incident;
        const blocked = burning && phase >= 4;
        const base = level.base;
        return <g key={level.id} className={`cut-level ${selected ? "is-selected" : ""} ${burning ? "is-incident" : ""}`}>
          <g role="button" tabIndex={0} aria-label={`Select ${level.name}`} aria-pressed={selected} className="cut-floor-hit" onClick={() => setFloor(level.id)} onKeyDown={e => activate(e, () => setFloor(level.id))}>
            <title>{level.name} — {level.use}</title>
            <polygon className="cut-back-wall" points={polygon([[0, 220, 0], [460, 220, 0], [460, 220, 75], [0, 220, 75]], base)} />
            <polygon className="cut-left-wall" points={polygon([[0, 0, 0], [0, 220, 0], [0, 220, 75], [0, 0, 75]], base)} />
            <polygon className="cut-slab-side" points={polygon([[0, 0, 0], [460, 0, 0], [460, 0, -10], [0, 0, -10]], base)} />
            <polygon className="cut-slab-side" points={polygon([[460, 0, 0], [460, 220, 0], [460, 220, -10], [460, 0, -10]], base)} />
            <polygon className="cut-floor" points={box(0, 0, 460, 220, base)} />
            <polygon className="cut-corridor" points={box(12, 100, 436, 35, base)} />
            <g className="cut-floor-label" transform={`translate(16 ${base - 53})`}>
              <path d="M0 0h123l11 15v37H0Z" /><text x="11" y="20">{level.name}</text><text x="11" y="38" className="cut-label-sub">{level.use}</text><path className="cut-leader" d={`M134 26L${169} ${53}`} />
            </g>
          </g>
          {level.rooms.map((id, i) => {
            const u = 12 + i * 111;
            const list = occupants.filter(o => o.floor === level.id && o.room === id);
            const hot = burning && id === "14B-201";
            const [tx, ty] = point(u + 3, 5, base, 5);
            return <g key={id} role="button" tabIndex={0} aria-label={`Open room ${id}`} className={`cut-room ${hot ? "hot" : ""}`} onClick={() => { setFloor(level.id); openRoom(id); }} onKeyDown={e => activate(e, () => { setFloor(level.id); openRoom(id); })}>
              <title>{id} · {list.length} occupants{hot ? " · Fire detected" : ""}</title>
              <polygon className="cut-room-floor" points={box(u, 8, 104, 88, base)} />
              {layers.heatmap && burning && <polygon className={`cut-risk ${hot ? "danger" : "warning"}`} points={box(u, 8, 104, 88, base)} />}
              <polygon className="cut-partition" points={polygon([[u, 18, 0], [u, 95, 0], [u, 95, 47], [u, 18, 47]], base)} />
              <polygon className="cut-partition-back" points={polygon([[u, 95, 0], [u + 77, 95, 0], [u + 77, 95, 47], [u, 95, 47]], base)} />
              <Furniture u={u + 12} v={48} base={base} server={level.id === "14" && i === 1} meeting={level.id === "13" || level.id === "G"} />
              <Furniture u={u + 12} v={165} base={base} meeting={level.id === "13"} />
              <text className="cut-room-label" x={tx} y={ty} transform={`rotate(12 ${tx} ${ty})`}>{id}</text>
              {layers.occupants && list.map((person, j) => {
                const [x, y] = point(u + 20 + j * 19, 30, base);
                return <g key={person.id} className={`cut-person ${incident && person.status !== "Safe" ? "at-risk" : "safe"}`} transform={`translate(${x} ${y})`}><circle cy="-19" r="3.5" /><path d="M0-14v10M-5-10h10M0-4l-4 7M0-4l4 7" /></g>;
              })}
              {hot && layers.fire && <g className="cut-fire" transform={`translate(${point(u + 60, 65, base)})`}>
                <ellipse className="cut-fire-aura" cy="-22" rx="72" ry="49" />
                <path className="cut-smoke" d="M-5-41C-48-80 16-100-15-126C10-111 52-85 22-51Z" />
                <path className="cut-flame" d="M-23 2C-47-24-14-44-17-67C0-54 2-38 3-30C15-45 16-53 12-72C49-39 43-2 14 5Z" />
                <path className="cut-flame-inner" d="M-8 3C-20-12-2-23-3-37C16-22 24-5 9 5Z" />
              </g>}
            </g>;
          })}
          <g className="cut-stairs">
            {[0, 1].map(side => { const u = side === 0 ? 8 : 410; return <g key={side} className={blocked && side === 0 && layers.blocked ? "blocked" : "clear"}>
              <polygon className="cut-stair-base" points={box(u, 144, 40, 62, base)} />
              {Array.from({ length: 8 }, (_, i) => <polygon key={i} className="cut-stair-step" points={box(u, 148 + i * 7, 38, 7, base, i * 5)} />)}
              <path className="cut-stair-rail" d={`M${point(u, 148, base, 12)}L${point(u, 203, base, 52)}M${point(u + 40, 148, base, 12)}L${point(u + 40, 203, base, 52)}`} />
              {(() => { const [x, y] = point(u + 2, 205, base, 52); return <g className="cut-exit-sign" transform={`translate(${x} ${y})`}><rect x="-2" y="-16" width="48" height="17" rx="2" /><text x="2" y="-4">{blocked && side === 0 && layers.blocked ? "BLOCKED" : side === 0 ? "EXIT A" : "EXIT B"}</text></g>; })()}
            </g>; })}
          </g>
          <g className="cut-columns">{[0, 115, 230, 345, 460].map(u => <path key={u} d={`M${point(u, 0, base)}L${point(u, 0, base, 74)}M${point(u, 220, base)}L${point(u, 220, base, 74)}`} />)}</g>
          <polygon className="cut-glass-side" points={polygon([[460, 0, 0], [460, 220, 0], [460, 220, 74], [460, 0, 74]], base)} />
          <path className="cut-beam" d={`M${point(0, 0, base, 74)}L${point(460, 0, base, 74)}L${point(460, 220, base, 74)}`} />
          {selected && layers.routes && <path className="cut-evac-route" d={`M${point(175, 100, base, 2)}L${point(175, 120, base, 2)}L${point(429, 120, base, 2)}L${point(429, 155, base, 2)}`} />}
          {selected && layers.sensors && [105, 240, 360].map(u => { const [x, y] = point(u, 120, base, 25); return <circle key={u} className="cut-sensor" cx={x} cy={y} r="5" />; })}
          {selected && layers.cameras && [90, 330].map(u => { const [x, y] = point(u, 95, base, 60); return <g key={u} className="cut-camera" transform={`translate(${x} ${y})`}><rect width="12" height="7" rx="1" /><path d="M12 1l5-3v11l-5-3M4 7v6" /></g>; })}
        </g>;
      })}
      <g className="cut-roof"><polygon points={box(0, 0, 460, 220, 105)} />{[60, 190, 310].map(u => <g key={u}><polygon className="cut-hvac-side" points={polygon([[u, 120, 0], [u + 56, 120, 0], [u + 56, 120, 20], [u, 120, 20]], 105)} /><polygon className="cut-hvac" points={box(u, 120, 56, 36, 105, 20)} /><path className="cut-hvac-grille" d={`M${point(u + 7, 128, 105, 20)}L${point(u + 47, 128, 105, 20)}M${point(u + 7, 138, 105, 20)}L${point(u + 47, 138, 105, 20)}`} /></g>)}<path className="cut-antenna" d={`M${point(390, 170, 105)}v-66m-12 20h24m-18-10h12`} /></g>
      {incident && layers.fire && <g className="cut-incident-label" transform="translate(725 130)"><path d="M0 45L-250 168" /><rect width="188" height="53" rx="6" /><text x="12" y="19">FIRE DETECTED</text><text x="12" y="35">14B-201 · Server Room</text><text x="12" y="47">{phase >= 3 ? "Spreading" : "Detected"} · {phase >= 5 ? "89°C" : "78°C"}</text></g>}
      {navigating && layers.routes && <path className="cut-responder-route" d="M570 644 704 614 784 530 784 330 730 310" />}
      <g className="cut-engine" transform="translate(250 634)"><path d="M0-27h85l23 16v27H0Z" /><rect x="8" y="-21" width="52" height="13" /><path d="M70-20h12l15 12H70Z" /><path className="cut-engine-ladder" d="M7-33h70m-60-4v9m12-9v9m12-9v9m12-9v9" /><circle cx="19" cy="17" r="9" /><circle cx="86" cy="17" r="9" /><path className="cut-emergency-light" d="M68-28h16" /></g>
      <g className="cut-ambulance" transform="translate(675 596)"><path d="M0-29h64l24 18v29H0Z" /><rect x="7" y="-23" width="42" height="22" /><path className="cut-med-cross" d="M28-18v14m-7-7h14" /><path d="M65-22l17 14H65Z" /><circle cx="17" cy="18" r="9" /><circle cx="72" cy="18" r="9" /><path className="cut-emergency-light" d="M55-32h17" /></g>
      <text className="cut-site-label" x="420" y="666">MAIN ENTRANCE</text>
    </svg>
    <div className="cutaway-status"><span className={incident ? "danger" : "safe"}>{incident ? "● Active incident · Floor 14" : "● All floors monitoring"}</span><span>{levels.find(l => l.id === floor)?.name} · {occupants.filter(o => o.floor === floor).length} occupants</span></div>
  </div>;
}