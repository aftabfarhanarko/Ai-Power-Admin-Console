"use client";
import React, { useState, useEffect, useRef } from "react";
import { Download, RefreshCw, Lock } from "lucide-react";
import {
  useGetAuditLogsQuery,
  useGetIpWhitelistQuery,
  useAddIpToWhitelistMutation,
  useRemoveIpFromWhitelistMutation,
  useGetGdprRequestsQuery,
  useCreateGdprRequestMutation,
  useUpdateGdprRequestMutation,
} from "../../features/security/securityApiSlice";

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_EVENTS = [
  {
    id: "EVT-90210-A",
    timestamp: "2023-11-24 14:22:01",
    activity: "System Registry Audit",
    source: "System-Auto",
    initials: "SY",
    avatarBg: "#eae6f4",
    avatarColor: "#3525cd",
    severity: "info",
    icon: "visibility",
  },
  {
    id: "EVT-90211-B",
    timestamp: "2023-11-24 13:05:45",
    activity: "SSH Access Refused",
    source: "IP: 45.33.2.14",
    initials: null,
    icon: "security",
    severity: "critical",
    avatarBg: "rgba(239,68,68,.1)",
    avatarColor: "#ef4444",
    isGlobe: true,
  },
  {
    id: "EVT-90212-C",
    timestamp: "2023-11-24 11:45:10",
    activity: "Data Subject Access Request (DSAR)",
    source: "jane.h@merchant.com",
    initials: "JH",
    avatarBg: "#b7eaff",
    avatarColor: "#006780",
    severity: "warning",
    icon: "more_vert",
  },
  {
    id: "EVT-90213-D",
    timestamp: "2023-11-24 10:12:33",
    activity: "Policy Update: GDPR v2.1",
    source: "Admin (Marcus V.)",
    initials: "ADM",
    avatarBg: "rgba(53,37,205,.1)",
    avatarColor: "#3525cd",
    severity: "info",
    icon: "edit",
  },
];

const SEVERITY_STYLES = {
  info:     { label: "Info",     bg: "rgba(53,37,205,.1)",  color: "#3525cd" },
  critical: { label: "Critical", bg: "rgba(239,68,68,.1)", color: "#ef4444" },
  warning:  { label: "Warning",  bg: "rgba(245,158,11,.1)", color: "#f59e0b" },
};

const TERMINAL_LINES_INITIAL = [
  { type: "ok",   msg: "AES-256 Encryption active across 14 clusters" },
  { type: "ok",   msg: "Key rotation successful: Node-A, Node-C" },
  { type: "info", msg: "Syncing GDPR registry with EU-West-1..." },
  { type: "warn", msg: "Abnormal login attempt blocked: IP 192.x.x.x" },
  { type: "ok",   msg: "Firewall rules updated: Zero Trust applied" },
  { type: "ok",   msg: "Heartbeat stable: 99.99% uptime" },
];

const NEW_TERMINAL_MESSAGES = [
  "Integrity check: No changes detected",
  "Memory scrub completed",
  "API Firewall blocking 0 malicious requests",
  "Scanning European DB replicas for sync delay",
];

const DATA_NODES = [
  { id: "frankfurt", label: "Frankfurt (EU-Central-1)", latency: "12ms", status: "Residency Locked", top: "33%", left: "50%" },
  { id: "paris",     label: "Paris (EU-West-3)",        latency: "8ms",  status: "Residency Locked", top: "38%", left: "46%" },
];

// ─── Terminal Component ─────────────────────────────────────────────────────────
function ThreatTerminal() {
  const [lines, setLines] = useState(TERMINAL_LINES_INITIAL);
  const scrollRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      const msg = NEW_TERMINAL_MESSAGES[Math.floor(Math.random() * NEW_TERMINAL_MESSAGES.length)];
      const type = msg.includes("Integrity") || msg.includes("Firewall") || msg.includes("Memory") ? "ok" : "info";
      setLines(prev => {
        const next = [...prev, { type, msg }];
        return next.length > 20 ? next.slice(-20) : next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const typeColor = { ok: "#10b981", info: "#c3c0ff", warn: "#f59e0b" };
  const typeLabel = { ok: "[OK]", info: "[INFO]", warn: "[WARN]" };

  return (
    <div className="sg-terminal">
      <div className="sg-terminal-dots">
        <div className="sg-dot red" />
        <div className="sg-dot yellow" />
        <div className="sg-dot green" />
        <span className="sg-terminal-label">Threat Terminal v4.2</span>
      </div>
      <div className="sg-terminal-body" ref={scrollRef}>
        {lines.map((line, i) => (
          <p key={i} className="sg-terminal-line">
            <span style={{ color: typeColor[line.type] }}>{typeLabel[line.type]}</span>
            <span className="sg-terminal-msg">{line.msg}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Map Node ───────────────────────────────────────────────────────────────────
function MapNode({ node }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="sg-map-node"
      style={{ top: node.top, left: node.left }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="sg-node-ping" style={{ animationDelay: node.id === "paris" ? "1s" : "0s" }} />
      <div className="sg-node-dot" />
      {hovered && (
        <div className="sg-node-tooltip">
          <p className="sg-node-tooltip-title">{node.label}</p>
          <div className="sg-node-tooltip-row"><span>Latency:</span><span style={{ color: "#10b981", fontWeight: 700 }}>{node.latency}</span></div>
          <div className="sg-node-tooltip-row"><span>Status:</span><span style={{ color: "#10b981", fontWeight: 700 }}>{node.status}</span></div>
        </div>
      )}
    </div>
  );
}

// ─── Compliance Gauge ───────────────────────────────────────────────────────────
function ComplianceGauge({ score = 94 }) {
  const r = 88;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="sg-gauge-wrap">
      <svg className="sg-gauge-svg" viewBox="0 0 192 192">
        <circle cx="96" cy="96" r={r} fill="transparent" stroke="#eae6f4" strokeWidth="12" />
        <circle
          cx="96" cy="96" r={r} fill="transparent"
          stroke="#3525cd" strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 96 96)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="sg-gauge-inner">
        <span className="sg-gauge-score">{score}%</span>
        <span className="sg-gauge-label">Total Score</span>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function SecurityPage() {
  const { data: auditData } = useGetAuditLogsQuery({ page: 1, limit: 20 });
  const [eventFilter, setEventFilter] = useState("all");
  const [hoveredRow, setHoveredRow] = useState(null);

  const events = auditData?.logs?.length ? auditData.logs : MOCK_EVENTS;
  const filtered = eventFilter === "critical"
    ? events.filter(e => e.severity === "critical")
    : events;

  return (
    <>
      <style>{`
        /* ── Page ───────────────────────────────────── */
        .sg-page { padding: 28px; background: #f8f9fc; min-height: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ── Breadcrumb + Page Header ───────────────── */
        .sg-breadcrumb { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
        .sg-bc-item { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #777587; }
        .sg-bc-item.active { color: #3525cd; }
        .sg-bc-sep { font-family: 'Material Symbols Outlined', sans-serif; font-size: 14px; color: #aaa; }
        .sg-page-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
        .sg-page-title { font-size: 30px; font-weight: 700; color: #1b1b24; line-height: 1.2; letter-spacing: -.01em; margin-top: 4px; }
        .sg-header-actions { display: flex; gap: 12px; align-items: center; }
        .sg-btn-outline { display: inline-flex; align-items: center; gap: 7px; border: 1px solid rgba(199,196,216,.5); background: #fff; border-radius: 12px; padding: 9px 18px; font-size: 13px; font-weight: 700; color: #1b1b24; cursor: pointer; transition: all .15s; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
        .sg-btn-outline:hover { background: #f4f2fb; }
        .sg-btn-primary { display: inline-flex; align-items: center; gap: 7px; background: #3525cd; color: #fff; border: none; border-radius: 12px; padding: 9px 18px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .sg-btn-primary:hover { opacity: .88; box-shadow: 0 6px 16px rgba(53,37,205,.25); }
        .sg-btn-primary:active { transform: scale(.97); }

        /* ── Metric Cards ───────────────────────────── */
        .sg-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
        .sg-metric-card { background: #fff; padding: 24px; border-radius: 24px; border: 1px solid rgba(199,196,216,.12); box-shadow: 0 1px 4px rgba(0,0,0,.04); transition: transform .25s, box-shadow .25s; cursor: default; }
        .sg-metric-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,.07); }
        .sg-metric-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
        .sg-metric-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .sg-ms { font-family: 'Material Symbols Outlined', sans-serif; font-size: 22px; font-weight: 400; }
        .sg-metric-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 999px; letter-spacing: .04em; }
        .sg-metric-label { font-size: 10px; font-weight: 700; color: #777587; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 6px; }
        .sg-metric-value { font-size: 32px; font-weight: 800; color: #1b1b24; line-height: 1; letter-spacing: -.02em; }
        .sg-metric-sub { font-size: 11px; color: #aaa; margin-top: 6px; }
        .sg-sparkline { width: 100%; height: 32px; margin-top: 16px; }
        .sg-progress-pulse { height: 8px; background: #f0ecf9; border-radius: 999px; overflow: hidden; margin-top: 16px; }
        .sg-progress-pulse-fill { height: 100%; background: #6b00b8; border-radius: 999px; animation: pp-pulse 2s ease-in-out infinite; }
        @keyframes pp-pulse { 0%,100%{opacity:.2}50%{opacity:.5} }

        /* ── Bento Grid ─────────────────────────────── */
        .sg-bento { display: grid; grid-template-columns: 1fr 320px; gap: 20px; margin-bottom: 20px; }

        /* ── Map Card ───────────────────────────────── */
        .sg-map-card { background: #fff; border-radius: 28px; border: 1px solid rgba(199,196,216,.12); box-shadow: 0 1px 4px rgba(0,0,0,.04); padding: 24px; overflow: hidden; }
        .sg-map-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
        .sg-map-card-title { font-size: 18px; font-weight: 700; color: #1b1b24; }
        .sg-map-card-sub { font-size: 13px; color: #777587; margin-top: 2px; }
        .sg-gdpr-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16,185,129,.08); color: #10b981; border-radius: 999px; padding: 5px 12px; font-size: 11px; font-weight: 700; letter-spacing: .04em; }
        .sg-gdpr-ping { width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: gdpr-ping 1.5s ease-in-out infinite; }
        @keyframes gdpr-ping { 0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5} }
        .sg-map-wrap { position: relative; height: 360px; background: #f8fafc; border-radius: 16px; overflow: hidden; }
        .sg-map-img { width: 100%; height: 100%; object-fit: cover; opacity: .8; mix-blend-mode: multiply; }
        .sg-map-legend { position: absolute; bottom: 12px; left: 12px; display: flex; gap: 10px; }
        .sg-map-legend-item { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.92); border: 1px solid rgba(199,196,216,.3); border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 600; backdrop-filter: blur(4px); }
        .sg-map-legend-dot { width: 12px; height: 12px; border-radius: 3px; }

        /* ── Map Nodes ──────────────────────────────── */
        .sg-map-node { position: absolute; transform: translate(-50%, -50%); cursor: pointer; z-index: 10; }
        .sg-node-ping { position: absolute; width: 24px; height: 24px; background: rgba(53,37,205,.2); border-radius: 50%; animation: node-ping 1.5s ease-in-out infinite; top: 50%; left: 50%; transform: translate(-50%,-50%); }
        @keyframes node-ping { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.8}50%{transform:translate(-50%,-50%) scale(1.6);opacity:0} }
        .sg-node-dot { width: 12px; height: 12px; background: #3525cd; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 3px rgba(53,37,205,.15); position: relative; z-index: 1; }
        .sg-node-tooltip { position: absolute; top: calc(100% + 10px); left: 50%; transform: translateX(-50%); background: #fff; border: 1px solid rgba(199,196,216,.3); border-radius: 12px; padding: 12px 14px; width: 170px; box-shadow: 0 8px 24px rgba(0,0,0,.1); z-index: 20; }
        .sg-node-tooltip-title { font-size: 12px; font-weight: 700; color: #1b1b24; margin-bottom: 8px; }
        .sg-node-tooltip-row { display: flex; justify-content: space-between; font-size: 10px; color: #777587; margin-top: 4px; }

        /* ── Right Column ───────────────────────────── */
        .sg-right { display: flex; flex-direction: column; gap: 20px; }

        /* ── Compliance Card ────────────────────────── */
        .sg-compliance-card { background: #fff; border-radius: 28px; border: 1px solid rgba(199,196,216,.12); box-shadow: 0 1px 4px rgba(0,0,0,.04); padding: 24px; }
        .sg-compliance-title { font-size: 18px; font-weight: 700; color: #1b1b24; margin-bottom: 20px; }
        .sg-gauge-wrap { position: relative; width: 192px; height: 192px; margin: 0 auto 20px; }
        .sg-gauge-svg { width: 100%; height: 100%; }
        .sg-gauge-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .sg-gauge-score { font-size: 36px; font-weight: 900; color: #1b1b24; letter-spacing: -.02em; line-height: 1; }
        .sg-gauge-label { font-size: 10px; font-weight: 700; color: #777587; text-transform: uppercase; letter-spacing: .1em; margin-top: 4px; }
        .sg-compliance-list { display: flex; flex-direction: column; gap: 12px; }
        .sg-compliance-row { display: flex; align-items: center; justify-content: space-between; }
        .sg-compliance-key { font-size: 13px; color: #777587; font-weight: 500; }
        .sg-compliance-val { font-size: 13px; font-weight: 700; }

        /* ── Threat Terminal ────────────────────────── */
        .sg-terminal { background: #302f39; border-radius: 28px; padding: 20px; height: 240px; overflow: hidden; display: flex; flex-direction: column; }
        .sg-terminal-dots { display: flex; align-items: center; gap: 6px; margin-bottom: 14px; }
        .sg-dot { width: 12px; height: 12px; border-radius: 50%; }
        .sg-dot.red { background: #ef4444; }
        .sg-dot.yellow { background: #f59e0b; }
        .sg-dot.green { background: #10b981; }
        .sg-terminal-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .1em; margin-left: auto; }
        .sg-terminal-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; scrollbar-width: thin; scrollbar-color: #45475a transparent; }
        .sg-terminal-body::-webkit-scrollbar { width: 3px; }
        .sg-terminal-body::-webkit-scrollbar-thumb { background: #45475a; border-radius: 10px; }
        .sg-terminal-line { display: flex; gap: 8px; font-family: 'SF Mono','Fira Code',monospace; font-size: 11px; line-height: 1.5; }
        .sg-terminal-msg { color: rgba(255,255,255,.6); }

        /* ── Event Registry ─────────────────────────── */
        .sg-events-card { background: #fff; border-radius: 28px; border: 1px solid rgba(199,196,216,.12); box-shadow: 0 1px 4px rgba(0,0,0,.04); padding: 24px; overflow: hidden; }
        .sg-events-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .sg-events-title { font-size: 18px; font-weight: 700; color: #1b1b24; }
        .sg-events-sub { font-size: 13px; color: #777587; margin-top: 2px; }
        .sg-filter-toggle { background: #f0ecf9; border-radius: 10px; padding: 4px; display: flex; gap: 4px; }
        .sg-filter-tab { border: none; background: transparent; border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 700; color: #777587; cursor: pointer; transition: all .15s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .sg-filter-tab.active { background: #fff; color: #1b1b24; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
        .sg-table { width: 100%; border-collapse: collapse; }
        .sg-table thead tr { background: #f8f7ff; border-bottom: 1px solid rgba(199,196,216,.2); }
        .sg-table th { padding: 12px 16px; font-size: 10px; font-weight: 700; color: #777587; text-transform: uppercase; letter-spacing: .1em; text-align: left; }
        .sg-table th:last-child { text-align: right; }
        .sg-table td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid rgba(199,196,216,.08); vertical-align: middle; }
        .sg-table tr:last-child td { border-bottom: none; }
        .sg-table tr:hover td { background: #f5f2ff; }
        .sg-event-id { font-family: 'SF Mono','Fira Code',monospace; font-size: 11px; color: #3525cd; font-weight: 600; }
        .sg-event-ts { font-size: 13px; color: #777587; }
        .sg-event-activity { font-size: 13px; font-weight: 600; color: #1b1b24; }
        .sg-event-source { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #777587; }
        .sg-event-avatar { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; flex-shrink: 0; }
        .sg-sev-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
        .sg-action-btn { background: transparent; border: none; cursor: pointer; color: #aaa; transition: color .15s; padding: 4px; display: flex; align-items: center; justify-content: flex-end; width: 100%; }
        .sg-action-btn:hover { color: #3525cd; }
        .sg-events-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(199,196,216,.12); font-size: 13px; color: #777587; font-weight: 500; }
        .sg-page-btn { background: transparent; border: 1px solid rgba(199,196,216,.3); border-radius: 8px; padding: 7px 10px; cursor: pointer; color: #555; display: inline-flex; align-items: center; transition: all .15s; }
        .sg-page-btn:hover:not(:disabled) { background: #f4f2fb; border-color: #c5b8f8; color: #3525cd; }
        .sg-page-btn:disabled { opacity: .35; cursor: not-allowed; }
        .sg-page-btns { display: flex; gap: 6px; }

        /* ── Emergency FAB ──────────────────────────── */
        .sg-fab { position: fixed; bottom: 28px; right: 28px; width: 60px; height: 60px; background: #ef4444; color: #fff; border: none; border-radius: 18px; box-shadow: 0 8px 24px rgba(239,68,68,.35); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 60; transition: transform .2s, box-shadow .2s; }
        .sg-fab:hover { transform: scale(1.07); box-shadow: 0 12px 32px rgba(239,68,68,.45); }
        .sg-fab:active { transform: scale(.96); }
        .sg-fab .sg-ms { font-size: 30px; transition: transform .3s; }
        .sg-fab:hover .sg-ms { transform: rotate(45deg); }
        .sg-fab-tooltip { position: absolute; right: calc(100% + 14px); background: #302f39; color: #fff; padding: 8px 14px; border-radius: 10px; font-size: 11px; font-weight: 700; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .2s; letter-spacing: .04em; }
        .sg-fab:hover .sg-fab-tooltip { opacity: 1; }
      `}</style>

      <div className="sg-page">
        {/* ── Page Header ── */}
        <div className="sg-page-header">
          <div>
            <div className="sg-breadcrumb">
              <span className="sg-bc-item">Enterprise Suite</span>
              <span className="sg-bc-sep material-symbols-outlined">chevron_right</span>
              <span className="sg-bc-item active">Security &amp; GDPR</span>
            </div>
            <h1 className="sg-page-title">Security &amp; Compliance Control</h1>
          </div>
          <div className="sg-header-actions">
            <button className="sg-btn-outline">
              <span className="sg-ms" style={{ fontSize: 18 }}>download</span>
              Export Report
            </button>
            <button className="sg-btn-primary">
              <RefreshCw size={15} />
              Run Audit
            </button>
          </div>
        </div>

        {/* ── Metric Cards ── */}
        <div className="sg-metrics">
          {/* Security Health Score */}
          <div className="sg-metric-card">
            <div className="sg-metric-head">
              <div className="sg-metric-icon" style={{ background: "#e2dfff" }}>
                <span className="sg-ms" style={{ color: "#3525cd" }}>health_and_safety</span>
              </div>
              <span className="sg-metric-badge" style={{ background: "rgba(16,185,129,.1)", color: "#10b981" }}>
                <span className="sg-ms" style={{ fontSize: 12 }}>trending_up</span>+0.2%
              </span>
            </div>
            <div className="sg-metric-label">Security Health Score</div>
            <div className="sg-metric-value">99.8%</div>
            <svg className="sg-sparkline" viewBox="0 0 100 20" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M0,15 L10,12 L20,16 L30,10 L40,12 L50,5 L60,8 L70,3 L80,5 L90,2 L100,4" />
            </svg>
          </div>

          {/* Data Privacy Index */}
          <div className="sg-metric-card">
            <div className="sg-metric-head">
              <div className="sg-metric-icon" style={{ background: "#b7eaff" }}>
                <span className="sg-ms" style={{ color: "#006780" }}>privacy_tip</span>
              </div>
              <span className="sg-metric-badge" style={{ background: "rgba(16,185,129,.1)", color: "#10b981" }}>STABLE</span>
            </div>
            <div className="sg-metric-label">Data Privacy Index</div>
            <div className="sg-metric-value" style={{ textTransform: "uppercase" }}>Optimal</div>
            <svg className="sg-sparkline" viewBox="0 0 100 20" fill="none" stroke="#006780" strokeWidth="2">
              <path d="M0,10 L20,10 L40,11 L60,9 L80,10 L100,10" />
            </svg>
          </div>

          {/* Active Vulnerabilities */}
          <div className="sg-metric-card">
            <div className="sg-metric-head">
              <div className="sg-metric-icon" style={{ background: "#ffdad6" }}>
                <span className="sg-ms" style={{ color: "#ef4444" }}>bug_report</span>
              </div>
              <span className="sg-metric-badge" style={{ background: "rgba(16,185,129,.1)", color: "#10b981" }}>SECURE</span>
            </div>
            <div className="sg-metric-label">Active Vulnerabilities</div>
            <div className="sg-metric-value">0</div>
            <div style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#aaa" }}>
              No threats detected in 24h
            </div>
          </div>

          {/* GDPR Compliance */}
          <div className="sg-metric-card">
            <div className="sg-metric-head">
              <div className="sg-metric-icon" style={{ background: "#f0dbff" }}>
                <span className="sg-ms" style={{ color: "#6b00b8" }}>gavel</span>
              </div>
              <span className="sg-metric-badge" style={{ background: "rgba(53,37,205,.1)", color: "#3525cd" }}>
                <span className="sg-ms" style={{ fontSize: 12 }}>verified</span>ISO 27001
              </span>
            </div>
            <div className="sg-metric-label">GDPR Compliance</div>
            <div className="sg-metric-value" style={{ textTransform: "uppercase" }}>Certified</div>
            <div className="sg-progress-pulse" style={{ marginTop: 16 }}>
              <div className="sg-progress-pulse-fill" style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        {/* ── Bento Grid: Map + Right Col ── */}
        <div className="sg-bento">
          {/* Global Data Residency Map */}
          <div className="sg-map-card">
            <div className="sg-map-card-header">
              <div>
                <div className="sg-map-card-title">Global Data Residency</div>
                <div className="sg-map-card-sub">Real-time status of merchant data storage nodes.</div>
              </div>
              <div className="sg-gdpr-badge">
                <span className="sg-gdpr-ping" />
                GDPR COMPLIANT
              </div>
            </div>
            <div className="sg-map-wrap">
              <img
                className="sg-map-img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB_fvH6bPI7BGIGs6zixbqDEKZpEiY5OBxPIApc5-EbuEVEUrPZaaqaMVPx9H2slidTk4rJOqEKcBsVuT3TE7Nahc5ccMCcYgRopa8_jg-HJxUd87dv5IS0bgJadHTm72oVUJiwmHNWOZ5A-97A08LG-y-_REuQVagN5C5yRfvq8ocI-2tiD-BpNgMf4FBV7AD6h2ZT-rDQaWm3r4ymIpmgO5YWUtmWZzDeLoCQ_x_zYYGlwVwMLXQ9wed1hIGeFerRO_59uT2c8s"
                alt="Global Data Residency Map"
              />
              {DATA_NODES.map(node => <MapNode key={node.id} node={node} />)}
              <div className="sg-map-legend">
                <div className="sg-map-legend-item">
                  <div className="sg-map-legend-dot" style={{ background: "#3525cd" }} />
                  Active Node
                </div>
                <div className="sg-map-legend-item">
                  <div className="sg-map-legend-dot" style={{ background: "rgba(16,185,129,.5)" }} />
                  GDPR Region
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="sg-right">
            {/* Compliance Readiness Gauge */}
            <div className="sg-compliance-card">
              <div className="sg-compliance-title">Compliance Readiness</div>
              <ComplianceGauge score={94} />
              <div className="sg-compliance-list">
                <div className="sg-compliance-row">
                  <span className="sg-compliance-key">SOC2 Renewal</span>
                  <span className="sg-compliance-val" style={{ color: "#10b981" }}>Completed</span>
                </div>
                <div className="sg-compliance-row">
                  <span className="sg-compliance-key">GDPR Annual Audit</span>
                  <span className="sg-compliance-val" style={{ color: "#f59e0b" }}>Pending (14d)</span>
                </div>
                <div className="sg-compliance-row">
                  <span className="sg-compliance-key">Internal Pentest</span>
                  <span className="sg-compliance-val" style={{ color: "#3525cd" }}>Scheduled</span>
                </div>
              </div>
            </div>

            {/* Threat Terminal */}
            <ThreatTerminal />
          </div>
        </div>

        {/* ── Security Event Registry ── */}
        <div className="sg-events-card">
          <div className="sg-events-header">
            <div>
              <div className="sg-events-title">Security Event Registry</div>
              <div className="sg-events-sub">Consolidated logs for audits, access, and detection.</div>
            </div>
            <div className="sg-filter-toggle">
              <button
                className={`sg-filter-tab ${eventFilter === "all" ? "active" : ""}`}
                onClick={() => setEventFilter("all")}
              >All Events</button>
              <button
                className={`sg-filter-tab ${eventFilter === "critical" ? "active" : ""}`}
                onClick={() => setEventFilter("critical")}
              >Critical Only</button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="sg-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Timestamp</th>
                  <th>Activity</th>
                  <th>Source / User</th>
                  <th>Severity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((evt) => {
                  const sev = SEVERITY_STYLES[evt.severity] || SEVERITY_STYLES.info;
                  return (
                    <tr key={evt.id}>
                      <td><span className="sg-event-id">{evt.id}</span></td>
                      <td><span className="sg-event-ts">{evt.timestamp}</span></td>
                      <td><span className="sg-event-activity">{evt.activity}</span></td>
                      <td>
                        <div className="sg-event-source">
                          <div
                            className="sg-event-avatar"
                            style={{ background: evt.avatarBg, color: evt.avatarColor }}
                          >
                            {evt.isGlobe
                              ? <span className="sg-ms" style={{ fontSize: 13 }}>public</span>
                              : evt.initials}
                          </div>
                          {evt.source}
                        </div>
                      </td>
                      <td>
                        <span className="sg-sev-badge" style={{ background: sev.bg, color: sev.color }}>
                          {sev.label}
                        </span>
                      </td>
                      <td>
                        <button className="sg-action-btn">
                          <span className="sg-ms" style={{ fontSize: 20 }}>{evt.icon || "visibility"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="sg-events-footer">
            <span>Showing 1-12 of 8,421 events</span>
            <div className="sg-page-btns">
              <button className="sg-page-btn" disabled>
                <span className="sg-ms" style={{ fontSize: 18 }}>chevron_left</span>
              </button>
              <button className="sg-page-btn">
                <span className="sg-ms" style={{ fontSize: 18 }}>chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Emergency Lockdown FAB ── */}
      <button className="sg-fab" title="Emergency Lockdown">
        <span className="sg-fab-tooltip">EMERGENCY LOCKDOWN</span>
        <Lock size={28} />
      </button>
    </>
  );
}
