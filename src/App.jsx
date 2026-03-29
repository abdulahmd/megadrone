import { useState, useEffect, useRef } from "react";

// ── Fonts via Google ──────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #070a0f;
    --bg2: #0d1117;
    --bg3: #141b24;
    --surface: #1a2232;
    --surface2: #1f2a3d;
    --border: #2a3a52;
    --accent: #00d4ff;
    --accent2: #0088cc;
    --accent3: #00ff9d;
    --warn: #ff6b35;
    --text: #c8d8e8;
    --text2: #6a8aaa;
    --text3: #3a5a7a;
    --heading: #e8f4ff;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Barlow', sans-serif; min-height: 100vh; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: var(--bg2); } ::-webkit-scrollbar-thumb { background: var(--border); }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pulse-glow { 0%,100%{box-shadow:0 0 10px var(--accent)} 50%{box-shadow:0 0 25px var(--accent),0 0 50px rgba(0,212,255,.2)} }
  @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes drone-hover { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-12px) rotate(1deg)} }

  /* Responsive Utility Classes */
  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .hero-split { flex-direction: column !important; text-align: center; gap: 32px !important; }
    .hero-metrics { justify-content: center !important; }
    .grid-3 { grid-template-columns: 1fr !important; }
    .grid-split { grid-template-columns: 1fr !important; }
    .app-container { padding: 24px 16px !important; }
    .research-layout { flex-direction: column !important; height: auto !important; }
    .research-sidebar { width: 100% !important; border-right: none !important; border-bottom: 1px solid var(--border); display: flex; overflow-x: auto; padding: 12px 16px !important; }
    .research-sidebar button { display: inline-block !important; width: auto !important; border-left: none !important; border-bottom: 2px solid transparent; padding: 8px 16px !important; white-space: nowrap; }
    .research-sidebar button.active { border-bottom-color: var(--accent) !important; background: none !important; }
    .research-content { padding: 24px 16px !important; }
    .task-row { grid-template-columns: 1fr !important; gap: 16px !important; }
    .task-status-col { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .about-header { flex-direction: column !important; gap: 16px !important; }
    h1 { font-size: 32px !important; }
    h2 { font-size: 22px !important; }
    .nav-container { padding: 0 16px !important; overflow-x: auto; }
    .nav-logo-wrap { padding-right: 12px !important; margin-right: 12px !important; }
    .nav-logo-text { display: none; }
    .nav-tabs { flex: 1; display: flex; min-width: max-content; }
    .nav-auth { margin-left: auto !important; }
    .filter-row { flex-wrap: wrap !important; }
    .about-team-grid { grid-template-columns: 1fr 1fr !important; }
    .login-card { width: 100% !important; max-width: 340px !important; }
  }
  @media (max-width: 480px) {
    .about-team-grid { grid-template-columns: 1fr !important; }
  }
`;
document.head.appendChild(style);

// ── Initial Data ───────────────────────────────────────────────────────────────
const INIT_TASKS = [
  { id: 1, title: "Frame design finalized", description: "Complete CAD model for 6x8ft frame", dueDate: "2025-02-15", category: "Mechanical", status: "Completed", assignedTo: "Alex" },
  { id: 2, title: "Motor selection", description: "Evaluate brushless motors for payload capacity", dueDate: "2025-02-28", category: "Electrical", status: "In Progress", assignedTo: "Jordan" },
  { id: 3, title: "Flight controller setup", description: "Configure PX4 autopilot firmware", dueDate: "2025-03-10", category: "Software", status: "In Progress", assignedTo: "Sam" },
  { id: 4, title: "ESC wiring harness", description: "Build and test ESC power distribution", dueDate: "2025-03-20", category: "Electrical", status: "Not Started", assignedTo: "Jordan" },
  { id: 5, title: "Navigation algorithm v1", description: "Implement GPS waypoint following", dueDate: "2025-04-01", category: "Software", status: "Not Started", assignedTo: "Sam" },
];

const INIT_POSTS = [
  { id: 1, title: "Frame Assembly Complete — Week 4 Update", date: "2025-01-28", author: "Alex Chen", content: "After weeks of design iterations and material sourcing, we've successfully completed the primary frame assembly for our 6×8ft drone. The carbon fiber arms are mounted, and structural testing shows rigidity within spec. Next up: motor mounts and landing gear.\n\nKey metrics from this phase:\n• Frame weight: 4.2 kg (under 4.5 kg target)\n• Arm deflection under load: <2mm\n• All mounting points torqued to spec" },
  { id: 2, title: "Power System Architecture Decided", date: "2025-02-10", author: "Jordan Lee", content: "After extensive research and simulation, we've settled on a 12S LiPo configuration with redundant power distribution. This gives us the thrust-to-weight ratio needed for our target payload while maintaining safe flight times.\n\nThe ESC selection process narrowed to two candidates — final decision pending bench tests this week." },
];

const INIT_RESEARCH = [
  { id: 1, title: "Navigation Systems", content: "## GPS + INS Fusion\n\nWe're using a dual-redundant GPS configuration with inertial navigation system (INS) fusion for robust positioning. Primary GPS: u-blox F9P with RTK capability for centimeter-level accuracy in open environments.\n\n**Backup modes:**\n- Optical flow (low altitude hover)\n- Barometric altitude hold\n- Compass heading fusion\n\nAll navigation data is processed through an Extended Kalman Filter (EKF) running on the main flight controller.", lastEdited: "2025-02-12", editedBy: "Sam" },
  { id: 2, title: "Payload Systems", content: "## Primary Payload Bay\n\nDesigned for 5kg maximum payload with quick-release mounting. Current planned payloads:\n- Multispectral imaging array (agricultural survey)\n- LiDAR sensor pod (terrain mapping)\n- Standard gimbal camera\n\nPayload bay features vibration isolation mounts and dedicated 5V/12V regulated power rails.", lastEdited: "2025-02-08", editedBy: "Alex" },
  { id: 3, title: "Flight Control", content: "## PX4 Autopilot Configuration\n\nRunning PX4 v1.14 on a Pixhawk 6C. Custom mixer configuration required for our unconventional frame geometry.\n\n**Control modes implemented:**\n- Manual/Stabilized\n- Altitude hold\n- Position hold (GPS)\n- Auto mission\n- Return-to-launch\n\nTuning in progress — rate controller gains are converging well on bench tests.", lastEdited: "2025-02-15", editedBy: "Sam" },
  { id: 4, title: "Power Systems", content: "## Electrical Architecture\n\n12S (50.4V) main battery bus with separate 5V/12V regulated rails for avionics.\n\n**Power budget (hover):**\n- Motors (8x): ~1800W total\n- Avionics: 45W\n- Payload: up to 100W\n- Total: ~1945W\n\nFlight time estimate: 18-22 minutes at hover with nominal payload.", lastEdited: "2025-02-10", editedBy: "Jordan" },
];

const INIT_MEMBERS = [
  { name: "Alex Chen", role: "Project Lead / Mechanical" },
  { name: "Jordan Lee", role: "Electrical Systems" },
  { name: "Sam Rivera", role: "Software / Avionics" },
  { name: "Morgan Kim", role: "Structural Analysis" },
  { name: "Casey Park", role: "Systems Integration" },
];

// ── Drone SVG ─────────────────────────────────────────────────────────────────
const DroneSVG = ({ size = 200 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ animation: "drone-hover 3s ease-in-out infinite", filter: "drop-shadow(0 0 20px rgba(0,212,255,0.6))" }}>
    {/* Arms */}
    <line x1="100" y1="100" x2="40" y2="40" stroke="#00d4ff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
    <line x1="100" y1="100" x2="160" y2="40" stroke="#00d4ff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
    <line x1="100" y1="100" x2="40" y2="160" stroke="#00d4ff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
    <line x1="100" y1="100" x2="160" y2="160" stroke="#00d4ff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
    {/* Motor mounts */}
    {[[40, 40], [160, 40], [40, 160], [160, 160]].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="14" fill="none" stroke="#00d4ff" strokeWidth="2" opacity=".9" />
        <circle cx={x} cy={y} r="8" fill="#0d1117" stroke="#00ff9d" strokeWidth="1.5" />
        <circle cx={x} cy={y} r="3" fill="#00ff9d" />
        {/* Prop blur */}
        <ellipse cx={x} cy={y} rx="20" ry="3" fill="none" stroke="#00d4ff" strokeWidth="1" opacity=".3" />
        <ellipse cx={x} cy={y} rx="3" ry="20" fill="none" stroke="#00d4ff" strokeWidth="1" opacity=".3" />
      </g>
    ))}
    {/* Body */}
    <rect x="82" y="82" width="36" height="36" rx="6" fill="#141b24" stroke="#00d4ff" strokeWidth="2" />
    <rect x="88" y="88" width="24" height="24" rx="4" fill="#1a2232" />
    <circle cx="100" cy="100" r="6" fill="#00d4ff" opacity=".9" />
    <circle cx="100" cy="100" r="3" fill="#e8f4ff" />
    {/* Landing gear */}
    <line x1="85" y1="118" x2="75" y2="135" stroke="#2a3a52" strokeWidth="3" strokeLinecap="round" />
    <line x1="115" y1="118" x2="125" y2="135" stroke="#2a3a52" strokeWidth="3" strokeLinecap="round" />
    <line x1="68" y1="135" x2="82" y2="135" stroke="#2a3a52" strokeWidth="3" strokeLinecap="round" />
    <line x1="118" y1="135" x2="132" y2="135" stroke="#2a3a52" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const cx = (...classes) => classes.filter(Boolean).join(" ");

const StatusBadge = ({ status }) => {
  const colors = { "Completed": "#00ff9d", "In Progress": "#00d4ff", "Not Started": "#6a8aaa" };
  return (
    <span style={{ fontSize: 11, fontFamily: "'Share Tech Mono'", color: colors[status] || "#6a8aaa", border: `1px solid ${colors[status] || "#6a8aaa"}`, padding: "2px 8px", borderRadius: 3, whiteSpace: "nowrap" }}>
      {status.toUpperCase()}
    </span>
  );
};

const CatBadge = ({ cat }) => {
  const colors = { Mechanical: "#ff6b35", Electrical: "#ffd700", Software: "#00d4ff" };
  return (
    <span style={{ fontSize: 10, fontFamily: "'Share Tech Mono'", color: colors[cat] || "#6a8aaa", background: `${colors[cat] || "#6a8aaa"}18`, padding: "2px 7px", borderRadius: 2, whiteSpace: "nowrap" }}>
      {cat?.toUpperCase()}
    </span>
  );
};

const Card = ({ children, style: s = {}, className = "" }) => (
  <div className={className} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "20px 24px", ...s }}>
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 11, fontFamily: "'Share Tech Mono'", color: "var(--text2)", letterSpacing: 1 }}>{label.toUpperCase()}</label>}
    <input {...props} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 4, padding: "8px 12px", color: "var(--text)", fontFamily: "'Barlow'", fontSize: 14, outline: "none", ...props.style }} />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 11, fontFamily: "'Share Tech Mono'", color: "var(--text2)", letterSpacing: 1 }}>{label.toUpperCase()}</label>}
    <textarea {...props} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 4, padding: "8px 12px", color: "var(--text)", fontFamily: "'Barlow'", fontSize: 14, outline: "none", resize: "vertical", minHeight: 100, ...props.style }} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 11, fontFamily: "'Share Tech Mono'", color: "var(--text2)", letterSpacing: 1 }}>{label.toUpperCase()}</label>}
    <select {...props} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 4, padding: "8px 12px", color: "var(--text)", fontFamily: "'Barlow'", fontSize: 14, outline: "none", ...props.style }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Btn = ({ children, variant = "primary", className = "", ...props }) => {
  const styles = {
    primary: { background: "var(--accent)", color: "#000", fontWeight: 600 },
    ghost: { background: "transparent", color: "var(--accent)", border: "1px solid var(--accent)" },
    danger: { background: "transparent", color: "var(--warn)", border: "1px solid var(--warn)" },
    success: { background: "var(--accent3)", color: "#000", fontWeight: 600 },
  };
  return (
    <button className={className} {...props} style={{ fontFamily: "'Share Tech Mono'", fontSize: 12, padding: "8px 16px", borderRadius: 4, cursor: "pointer", border: "none", letterSpacing: 1, transition: "opacity .2s", ...styles[variant], ...props.style }}
      onMouseEnter={e => e.currentTarget.style.opacity = ".8"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      {children}
    </button>
  );
};

// ── Login Page ────────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [glitch, setGlitch] = useState(false);

  const tryLogin = () => {
    if (pw === "wabisabi") { onLogin("team"); }
    else { setErr("INVALID CREDENTIALS"); setGlitch(true); setTimeout(() => setGlitch(false), 600); }
  };

  return (
    <div className="login-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)", position: "relative", overflow: "hidden", padding: "0 16px" }}>
      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "50px 50px", opacity: .15 }} />
      {/* Scan line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--accent), transparent)", animation: "scan 4s linear infinite", opacity: .4 }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 40, animation: "fadeUp .6s ease", width: "100%" }}>
        <DroneSVG size={120} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--accent)", letterSpacing: 4, marginBottom: 8 }}>AIAA UNDERGRADUATE CHAPTER</div>
          <h1 style={{ fontFamily: "'Orbitron'", fontSize: 36, fontWeight: 900, color: "var(--heading)", letterSpacing: 2, filter: glitch ? "blur(2px)" : "none", transition: "filter .1s" }}>DRONE PROJECT</h1>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--text3)", letterSpacing: 3, marginTop: 4 }}>MISSION CONTROL — v0.1 MVP</div>
        </div>

        <Card className="login-card" style={{ width: 340, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 12, color: "var(--accent)", letterSpacing: 2 }}>ACCESS TERMINAL</div>
          <Input
            label="Team Password"
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && tryLogin()}
            placeholder="Enter team password..."
          />
          {err && <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--warn)", letterSpacing: 1 }}>⚠ {err}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={tryLogin} style={{ flex: 1 }}>TEAM LOGIN</Btn>
            <Btn variant="ghost" onClick={() => onLogin("guest")} style={{ flex: 1 }}>GUEST ACCESS</Btn>
          </div>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "var(--text3)", textAlign: "center" }}>
            GUEST MODE: READ-ONLY ACCESS
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Nav ───────────────────────────────────────────────────────────────────────
const Nav = ({ tab, setTab, isTeam, onLogout }) => {
  const tabs = ["Home", "Research", "Calendar", "Blog", "About"];
  return (
    <nav className="nav-container" style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", gap: 0, position: "sticky", top: 0, zIndex: 100 }}>
      <div className="nav-logo-wrap" style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 32, paddingRight: 24, borderRight: "1px solid var(--border)" }}>
        <div style={{ width: 28, height: 28 }}><svg viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="4" fill="#00d4ff" /><line x1="14" y1="14" x2="5" y2="5" stroke="#00d4ff" strokeWidth="2" /><line x1="14" y1="14" x2="23" y2="5" stroke="#00d4ff" strokeWidth="2" /><line x1="14" y1="14" x2="5" y2="23" stroke="#00d4ff" strokeWidth="2" /><line x1="14" y1="14" x2="23" y2="23" stroke="#00d4ff" strokeWidth="2" /></svg></div>
        <span className="nav-logo-text" style={{ fontFamily: "'Orbitron'", fontSize: 13, fontWeight: 700, color: "var(--heading)", letterSpacing: 2 }}>AIAA DRONE</span>
      </div>
      <div className="nav-tabs">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontFamily: "'Share Tech Mono'", fontSize: 12, letterSpacing: 1, padding: "18px 16px", background: "none", border: "none", color: tab === t ? "var(--accent)" : "var(--text2)", cursor: "pointer", borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent", transition: "color .2s" }}
          >{t.toUpperCase()}</button>
        ))}
      </div>
      <div className="nav-auth" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <span className="hide-mobile" style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: isTeam ? "var(--accent3)" : "var(--text3)", letterSpacing: 1 }}>
          {isTeam ? "● TEAM" : "○ GUEST"}
        </span>
        <Btn variant="ghost" onClick={onLogout} style={{ fontSize: 10, padding: "5px 12px" }}>LOGOUT</Btn>
      </div>
    </nav>
  );
};

// ── Home Page ─────────────────────────────────────────────────────────────────
const HomePage = ({ tasks, posts }) => {
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pct = Math.round((completed / tasks.length) * 100);
  const next = tasks.find(t => t.status !== "Completed");

  return (
    <div className="app-container" style={{ padding: "40px 32px", maxWidth: 1100, margin: "0 auto", animation: "fadeUp .5s ease" }}>
      {/* Hero */}
      <div className="hero-split" style={{ display: "flex", alignItems: "center", gap: 48, marginBottom: 48 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--accent)", letterSpacing: 4, marginBottom: 12 }}>AIAA UNDERGRADUATE DRONE PROJECT</div>
          <h1 style={{ fontFamily: "'Orbitron'", fontSize: 42, fontWeight: 900, color: "var(--heading)", lineHeight: 1.15, marginBottom: 16 }}>AUTONOMOUS<br className="hide-mobile" />FLIGHT<br className="hide-mobile" /><span style={{ color: "var(--accent)" }}>SYSTEMS</span></h1>
          <p style={{ color: "var(--text2)", lineHeight: 1.7, maxWidth: 420, fontSize: 15, margin: "0 auto" }}>
            Designing, building, and flying a full-scale 6×8 ft autonomous drone for research, competition, and real-world mission scenarios.
          </p>
          <div className="hero-metrics" style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent3)", animation: "pulse-glow 2s ease infinite" }} />
            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--accent3)", letterSpacing: 2 }}>PHASE: FRAME ASSEMBLY</span>
          </div>
        </div>
        <div className="hero-drone">
          <DroneSVG size={220} />
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Completion", value: `${pct}%`, sub: `${completed}/${tasks.length} tasks done` },
          { label: "Next Milestone", value: next?.title?.split(" ").slice(0, 3).join(" ") || "TBD", sub: next ? `Due ${next.dueDate}` : "" },
          { label: "Latest Post", value: posts[0]?.date || "—", sub: posts[0]?.title?.slice(0, 30) + "…" },
        ].map(m => (
          <Card key={m.label}>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "var(--text2)", letterSpacing: 2, marginBottom: 8 }}>{m.label.toUpperCase()}</div>
            <div style={{ fontFamily: "'Orbitron'", fontSize: 22, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Progress bar */}
      <Card style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--text2)", letterSpacing: 2 }}>OVERALL PROGRESS</span>
          <span style={{ fontFamily: "'Orbitron'", fontSize: 13, color: "var(--accent)" }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: "var(--bg3)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--accent2), var(--accent), var(--accent3))", borderRadius: 3, transition: "width 1s ease" }} />
        </div>
      </Card>

      {/* Recent tasks */}
      <div className="grid-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--text2)", letterSpacing: 2, marginBottom: 16 }}>ACTIVE TASKS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.filter(t => t.status !== "Completed").slice(0, 3).map(t => (
              <div key={t.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--heading)", marginBottom: 4 }}>{t.title}</div>
                  <CatBadge cat={t.category} />
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--text2)", letterSpacing: 2, marginBottom: 16 }}>RECENT UPDATES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {posts.slice(0, 2).map(p => (
              <div key={p.id} style={{ paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 13, color: "var(--heading)", marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "var(--text3)" }}>{p.date} • {p.author}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Research Tab ──────────────────────────────────────────────────────────────
const ResearchTab = ({ sections, setSections, isTeam }) => {
  const [active, setActive] = useState(sections[0]?.id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});

  const sec = sections.find(s => s.id === active);

  const startEdit = () => { setDraft({ ...sec }); setEditing(true); };
  const save = () => {
    setSections(sections.map(s => s.id === active ? { ...draft, lastEdited: new Date().toISOString().slice(0, 10), editedBy: "You" } : s));
    setEditing(false);
  };

  return (
    <div className="research-layout" style={{ display: "flex", height: "calc(100vh - 56px)", animation: "fadeUp .5s ease" }}>
      {/* Sidebar */}
      <div className="research-sidebar" style={{ width: 220, background: "var(--bg2)", borderRight: "1px solid var(--border)", padding: "24px 0", overflowY: "auto" }}>
        <div className="hide-mobile" style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "var(--text3)", letterSpacing: 2, padding: "0 20px 16px" }}>SECTIONS</div>
        {sections.map(s => (
          <button key={s.id} onClick={() => { setActive(s.id); setEditing(false); }}
            className={active === s.id ? "active" : ""}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 20px", background: active === s.id ? "var(--surface)" : "none", borderLeft: active === s.id ? "2px solid var(--accent)" : "2px solid transparent", border: "none", color: active === s.id ? "var(--accent)" : "var(--text2)", fontFamily: "'Share Tech Mono'", fontSize: 12, cursor: "pointer", letterSpacing: .5 }}
          >{s.title}</button>
        ))}
      </div>

      {/* Content */}
      <div className="research-content" style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        {sec && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "'Orbitron'", fontSize: 24, fontWeight: 700, color: "var(--heading)", marginBottom: 6 }}>{sec.title}</h2>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "var(--text3)" }}>Last edited {sec.lastEdited} by {sec.editedBy}</div>
              </div>
              {isTeam && !editing && <Btn variant="ghost" onClick={startEdit}>EDIT</Btn>}
            </div>

            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Textarea label="Content (Markdown supported)" value={draft.content} onChange={e => setDraft({ ...draft, content: e.target.value })} style={{ minHeight: 400, fontFamily: "'Share Tech Mono'", fontSize: 13 }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn onClick={save}>SAVE</Btn>
                  <Btn variant="ghost" onClick={() => setEditing(false)}>CANCEL</Btn>
                </div>
              </div>
            ) : (
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "var(--text)", fontSize: 14, fontFamily: "'Barlow'" }}>
                {sec.content.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) return <h3 key={i} style={{ fontFamily: "'Orbitron'", fontSize: 16, color: "var(--accent)", marginTop: 20, marginBottom: 8 }}>{line.slice(3)}</h3>;
                  if (line.startsWith("**") && line.endsWith("**")) return <strong key={i} style={{ color: "var(--heading)", display: "block", marginTop: 12 }}>{line.slice(2, -2)}</strong>;
                  if (line.startsWith("- ")) return <div key={i} style={{ paddingLeft: 16, color: "var(--text2)" }}>• {line.slice(2)}</div>;
                  return <span key={i}>{line}<br /></span>;
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── Calendar / Tasks ──────────────────────────────────────────────────────────
const CalendarTab = ({ tasks, setTasks, isTeam }) => {
  const [view, setView] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", category: "Mechanical", status: "Not Started", assignedTo: "" });

  const addTask = () => {
    if (!form.title) return;
    setTasks([...tasks, { ...form, id: Date.now() }]);
    setForm({ title: "", description: "", dueDate: "", category: "Mechanical", status: "Not Started", assignedTo: "" });
    setShowForm(false);
  };

  const updateStatus = (id, status) => setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  const deleteTask = id => setTasks(tasks.filter(t => t.id !== id));

  const cats = ["All", "Mechanical", "Electrical", "Software"];
  const filtered = filter === "All" ? tasks : tasks.filter(t => t.category === filter);

  return (
    <div className="app-container" style={{ padding: "32px", maxWidth: 1000, margin: "0 auto", animation: "fadeUp .5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Orbitron'", fontSize: 24, fontWeight: 700, color: "var(--heading)" }}>TASK TRACKER</h2>
        {isTeam && <Btn onClick={() => setShowForm(!showForm)}>+ NEW TASK</Btn>}
      </div>

      {showForm && (
        <Card className="grid-split" style={{ marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Task Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task name..." style={{ gridColumn: "1 / -1" }} />
          <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ minHeight: 70, gridColumn: "1 / -1" }} />
          <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <Input label="Assigned To" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="Name..." />
          <Select label="Category" options={["Mechanical", "Electrical", "Software"]} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <Select label="Status" options={["Not Started", "In Progress", "Completed"]} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10 }}>
            <Btn onClick={addTask}>CREATE TASK</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>CANCEL</Btn>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="filter-row" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, padding: "6px 14px", borderRadius: 3, border: "1px solid", borderColor: filter === c ? "var(--accent)" : "var(--border)", background: filter === c ? "rgba(0,212,255,.1)" : "none", color: filter === c ? "var(--accent)" : "var(--text2)", cursor: "pointer", letterSpacing: 1 }}>
            {c.toUpperCase()}
          </button>
        ))}
        <div style={{ marginLeft: "auto", fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--text3)", alignSelf: "center" }}>
          {filtered.length} TASKS
        </div>
      </div>

      {/* Task list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(t => (
          <Card key={t.id} className="task-row" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: "var(--heading)", fontWeight: 500 }}>{t.title}</span>
                <CatBadge cat={t.category} />
              </div>
              {t.description && <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>{t.description}</div>}
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "var(--text3)" }}>
                {t.dueDate && `DUE ${t.dueDate}`}{t.assignedTo && ` • ${t.assignedTo}`}
              </div>
            </div>
            <div className="task-status-col">
              {isTeam ? (
                <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}
                  style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 3, padding: "4px 8px", color: "var(--text)", fontFamily: "'Share Tech Mono'", fontSize: 11, cursor: "pointer" }}>
                  {["Not Started", "In Progress", "Completed"].map(s => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <StatusBadge status={t.status} />
              )}
              {isTeam && <Btn variant="danger" onClick={() => deleteTask(t.id)} style={{ padding: "5px 10px", fontSize: 10, marginLeft: 16 }}>✕</Btn>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── Blog Tab ──────────────────────────────────────────────────────────────────
const BlogTab = ({ posts, setPosts, isTeam }) => {
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", content: "" });

  const publish = () => {
    if (!form.title || !form.content) return;
    const post = { ...form, id: Date.now(), date: new Date().toISOString().slice(0, 10) };
    setPosts([post, ...posts]);
    setForm({ title: "", author: "", content: "" });
    setShowForm(false);
  };

  const deletePost = id => { setPosts(posts.filter(p => p.id !== id)); setSelected(null); };

  if (selected) {
    const post = posts.find(p => p.id === selected);
    return (
      <div className="app-container" style={{ padding: "40px 32px", maxWidth: 760, margin: "0 auto", animation: "fadeUp .4s ease" }}>
        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--text2)", fontFamily: "'Share Tech Mono'", fontSize: 11, cursor: "pointer", marginBottom: 24, letterSpacing: 1 }}>← BACK TO UPDATES</button>
        <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "var(--text3)", marginBottom: 8 }}>{post.date} • {post.author}</div>
        <h2 style={{ fontFamily: "'Orbitron'", fontSize: 26, fontWeight: 700, color: "var(--heading)", marginBottom: 24, lineHeight: 1.3 }}>{post.title}</h2>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.9, color: "var(--text)", fontSize: 15, fontFamily: "'Barlow'" }}>{post.content}</div>
        {isTeam && <div style={{ marginTop: 32 }}><Btn variant="danger" onClick={() => deletePost(post.id)}>DELETE POST</Btn></div>}
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: "32px", maxWidth: 900, margin: "0 auto", animation: "fadeUp .5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Orbitron'", fontSize: 24, fontWeight: 700, color: "var(--heading)" }}>MISSION UPDATES</h2>
        {isTeam && <Btn onClick={() => setShowForm(!showForm)}>+ NEW POST</Btn>}
      </div>

      {showForm && (
        <Card style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Post Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Update title..." />
          <Input label="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Your name..." />
          <Textarea label="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ minHeight: 180 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={publish}>PUBLISH</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>CANCEL</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {posts.map(p => (
          <Card key={p.id} style={{ cursor: "pointer", transition: "border-color .2s" }}
            onClick={() => setSelected(p.id)}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "var(--text3)", marginBottom: 8 }}>{p.date} • {p.author}</div>
            <div style={{ fontFamily: "'Orbitron'", fontSize: 16, fontWeight: 600, color: "var(--heading)", marginBottom: 10 }}>{p.title}</div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{p.content.slice(0, 160)}…</div>
            <div style={{ marginTop: 12, fontFamily: "'Share Tech Mono'", fontSize: 10, color: "var(--accent)", letterSpacing: 1 }}>READ MORE →</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── About Tab ─────────────────────────────────────────────────────────────────
const AboutTab = ({ members, setMembers, isTeam }) => {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(members);
  const [newMember, setNewMember] = useState({ name: "", role: "" });

  const save = () => { setMembers(draft); setEditMode(false); };
  const removeMember = i => setDraft(draft.filter((_, idx) => idx !== i));
  const addMember = () => {
    if (newMember.name) { setDraft([...draft, newMember]); setNewMember({ name: "", role: "" }); }
  };

  return (
    <div className="app-container" style={{ padding: "40px 32px", maxWidth: 900, margin: "0 auto", animation: "fadeUp .5s ease" }}>
      <div className="about-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--accent)", letterSpacing: 3, marginBottom: 8 }}>ABOUT THE PROJECT</div>
          <h2 style={{ fontFamily: "'Orbitron'", fontSize: 30, fontWeight: 900, color: "var(--heading)" }}>THE TEAM</h2>
        </div>
        {isTeam && !editMode && <Btn variant="ghost" onClick={() => { setDraft(members); setEditMode(true); }}>EDIT TEAM</Btn>}
      </div>

      {/* Mission */}
      <Card style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--text2)", letterSpacing: 2, marginBottom: 12 }}>MISSION STATEMENT</div>
        <p style={{ lineHeight: 1.8, color: "var(--text)", fontSize: 15 }}>
          To design, build, and fly a fully autonomous 6×8 ft heavy-lift drone system — demonstrating cutting-edge aerospace engineering, integrated avionics, and real-world mission capability. Our team of undergraduate engineers aims to advance the state of accessible autonomous flight through collaborative research and hands-on development.
        </p>
      </Card>

      {/* Drone specs */}
      <Card style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--text2)", letterSpacing: 2, marginBottom: 16 }}>VEHICLE SPECIFICATIONS</div>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            ["Dimensions", "6 ft × 8 ft"],
            ["Configuration", "Quadrotor"],
            ["Max Payload", "5 kg"],
            ["Propulsion", "12S Brushless"],
            ["Navigation", "GPS + INS"],
            ["Flight Time", "18–22 min"],
          ].map(([k, v]) => (
            <div key={k} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "var(--text3)", letterSpacing: 2, marginBottom: 4 }}>{k.toUpperCase()}</div>
              <div style={{ fontFamily: "'Orbitron'", fontSize: 14, color: "var(--accent)" }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Team */}
      <Card>
        <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: "var(--text2)", letterSpacing: 2, marginBottom: 20 }}>TEAM ROSTER</div>
        <div className="about-team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {(editMode ? draft : members).map((m, i) => (
            <div key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "14px 16px", position: "relative" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface2)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "'Orbitron'", fontSize: 14, color: "var(--accent)", fontWeight: 700 }}>{m.name[0]}</span>
              </div>
              <div style={{ fontWeight: 500, color: "var(--heading)", fontSize: 14, marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "var(--text2)" }}>{m.role}</div>
              {editMode && <button onClick={() => removeMember(i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: "var(--warn)", cursor: "pointer", fontSize: 14 }}>✕</button>}
            </div>
          ))}
        </div>

        {editMode && (
          <div className="filter-row" style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "flex-end" }}>
            <Input label="Name" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} placeholder="Full name..." />
            <Input label="Role" value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} placeholder="Role / team..." />
            <Btn variant="success" onClick={addMember} style={{ whiteSpace: "nowrap" }}>ADD</Btn>
          </div>
        )}
        {editMode && (
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <Btn onClick={save}>SAVE CHANGES</Btn>
            <Btn variant="ghost" onClick={() => setEditMode(false)}>CANCEL</Btn>
          </div>
        )}
      </Card>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(null); // null | "team" | "guest"
  const [tab, setTab] = useState("Home");
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [posts, setPosts] = useState(INIT_POSTS);
  const [research, setResearch] = useState(INIT_RESEARCH);
  const [members, setMembers] = useState(INIT_MEMBERS);

  if (!auth) return <LoginPage onLogin={setAuth} />;

  const isTeam = auth === "team";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Nav tab={tab} setTab={setTab} isTeam={isTeam} onLogout={() => setAuth(null)} />
      {tab === "Home" && <HomePage tasks={tasks} posts={posts} />}
      {tab === "Research" && <ResearchTab sections={research} setSections={setResearch} isTeam={isTeam} />}
      {tab === "Calendar" && <CalendarTab tasks={tasks} setTasks={setTasks} isTeam={isTeam} />}
      {tab === "Blog" && <BlogTab posts={posts} setPosts={setPosts} isTeam={isTeam} />}
      {tab === "About" && <AboutTab members={members} setMembers={setMembers} isTeam={isTeam} />}
    </div>
  );
}
