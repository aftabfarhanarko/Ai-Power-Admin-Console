"use client";
import React, { useState, useMemo } from "react";
import { Plus, XCircle } from "lucide-react";
import {
  useGetIncidentsQuery,
  useCreateIncidentMutation,
  useGetMaintenanceConfigsQuery,
} from "../../features/status/statusApiSlice";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_INCIDENTS = [
  {
    id: "INC-4820",
    title: "DATABASE_READ_TIMEOUT_LATENCY_SPIKE",
    severity: "critical",
    status: "investigating",
    startedAt: "14:02 UTC",
    duration: "00:42:12",
    responder: "Sarah Chen (On-Call)",
    region: "us-east-1",
    progress: 75,
    logs: [
      { time: "[14:05]", type: "success", msg: "System detected elevated latency in RDS Read Replicas." },
      { time: "[14:12]", type: "success", msg: "Automated failover initiated. Redirecting traffic to Secondary Node (Cluster-B)." },
      { time: "[14:28]", type: "warning", msg: "Manual intervention required: Secondary node sync lag detected (14s)." },
      { time: "[14:44]", type: "active", msg: "Sarah Chen: Patching primary storage driver... 82% complete. _" },
    ],
  },
];

const MOCK_MAINTENANCE = [
  { id: "1", month: "OCT", day: "24", title: "ElasticSearch Patching", desc: "v7.10 to v8.4 Migration", tag: "22:00 - 02:00 UTC" },
  { id: "2", month: "OCT", day: "28", title: "Edge CDN Refresh", desc: "PoP expansion in Singapore", tag: "Global Rollout" },
];

const MOCK_UPDATES = [
  { date: "October 18, 2023", title: "TLS 1.3 Optimization", desc: "Handshake latency reduced by 15ms globally." },
  { date: "October 14, 2023", title: "Ingress Controller v3.1", desc: "Support for advanced gRPC load balancing." },
  { date: "October 10, 2023", title: "Redundancy Expansion", desc: "New hot-standby nodes for Auth cluster." },
];

const INFRASTRUCTURE = [
  { name: "API Gateway", node: "Core-Routing-v2", uptime: "99.998%", latency: "12ms", load: 42, latencyColor: "#10b981", status: "Active", statusColor: "#10b981" },
  { name: "Auth Service", node: "IAM-Cluster-01", uptime: "99.991%", latency: "28ms", load: 68, latencyColor: "#10b981", status: "Active", statusColor: "#10b981" },
  { name: "Database Cluster", node: "Aurora-Primary-East", uptime: "99.852%", latency: "142ms", load: 85, latencyColor: "#f59e0b", status: "Elevated", statusColor: "#f59e0b" },
  { name: "Storage Layers", node: "S3-Object-Optimized", uptime: "100.00%", latency: "44ms", load: 15, latencyColor: "#10b981", status: "Active", statusColor: "#10b981" },
];

const REGIONS = [
  { name: "North America (US-East / US-West)", avg: "99.98%", degradeRate: 0.05, downRate: 0.02 },
  { name: "Europe (EU-Central / EU-West)", avg: "99.94%", degradeRate: 0.08, downRate: 0.01 },
  { name: "Asia Pacific (AP-Northeast / AP-South)", avg: "99.99%", degradeRate: 0.02, downRate: 0.0 },
];

function generateHeatmapDays(seed, degradeRate, downRate) {
  return Array.from({ length: 90 }, (_, i) => {
    const val = ((seed * 7 + i * 13 + i * i) % 100) / 100;
    if (val < downRate) return "down";
    if (val < downRate + degradeRate) return "warn";
    return "ok";
  });
}

function UptimeBar({ days }) {
  return (
    <div className="si-heatmap-row">
      {days.map((d, i) => (
        <div
          key={i}
          title={`Day ${i + 1}: ${d === "ok" ? "Healthy" : d === "warn" ? "Degraded" : "Down"}`}
          className={`si-heatmap-cell ${d}`}
        />
      ))}
    </div>
  );
}

function IncidentModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: "", severity: "critical", status: "investigating", affectedServices: [] });
  const allSvcs = ["API Gateway", "Database Cluster", "Auth Service", "Storage Layers"];
  const toggle = (s) => setForm((f) => ({
    ...f,
    affectedServices: f.affectedServices.includes(s)
      ? f.affectedServices.filter(x => x !== s)
      : [...f.affectedServices, s],
  }));

  return (
    <div className="si-backdrop" onClick={onClose}>
      <div className="si-modal" onClick={e => e.stopPropagation()}>
        <div className="si-modal-header">
          <h2>Create Incident</h2>
          <button className="si-modal-close" onClick={onClose}><XCircle size={18} /></button>
        </div>
        <form className="si-modal-form" onSubmit={e => { e.preventDefault(); onCreate(form); onClose(); }}>
          <div className="si-fg">
            <label>Incident Title</label>
            <input required placeholder="DATABASE_READ_TIMEOUT..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="si-fg-row">
            <div className="si-fg">
              <label>Severity</label>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                <option value="critical">SEV-1 Critical</option>
                <option value="high">SEV-2 High</option>
                <option value="medium">SEV-3 Medium</option>
                <option value="low">SEV-4 Low</option>
              </select>
            </div>
            <div className="si-fg">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="investigating">Investigating</option>
                <option value="identified">Identified</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div className="si-fg">
            <label>Affected Services</label>
            <div className="si-chips">
              {allSvcs.map(s => (
                <button key={s} type="button" className={`si-chip ${form.affectedServices.includes(s) ? "active" : ""}`} onClick={() => toggle(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="si-modal-footer">
            <button type="button" className="si-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="si-btn-primary">Create Incident</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StatusPage() {
  const { data: apiIncidents } = useGetIncidentsQuery();
  const { data: apiMaintenance } = useGetMaintenanceConfigsQuery();
  const [createIncident] = useCreateIncidentMutation();

  const incidents = apiIncidents?.length ? apiIncidents : MOCK_INCIDENTS;
  const maintenanceRoadmap = MOCK_MAINTENANCE;
  const activeCount = incidents.filter(i => i.status !== "resolved").length;
  const [modalOpen, setModalOpen] = useState(false);

  const heatmaps = useMemo(() =>
    REGIONS.map((r, ri) => generateHeatmapDays(ri * 37 + 11, r.degradeRate, r.downRate)), []);

  const handleCreate = async (data) => {
    try { await createIncident(data).unwrap(); } catch { /* handled */ }
  };

  return (
    <>
      <style>{`
        /* ── Page wrapper ───────────────────────────────── */
        .si-page {
          padding: 28px;
          background: #f8f9fc;
          min-height: 100%;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── Page header row ────────────────────────────── */
        .si-page-toprow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .si-page-heading { font-size: 22px; font-weight: 800; color: #1b1b24; }
        .si-page-sub { font-size: 13px; color: #777587; margin-top: 2px; }
        .si-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: #3525cd; color: #fff; border: none; border-radius: 8px;
          padding: 9px 18px; font-size: 12px; font-weight: 700; cursor: pointer;
          transition: opacity .15s, box-shadow .15s; letter-spacing: .03em;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .si-btn-primary:hover { opacity: .88; box-shadow: 0 4px 12px rgba(53,37,205,.25); }

        /* ── Stats Row ──────────────────────────────────── */
        .si-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .si-stat-card {
          background: #fff;
          padding: 20px;
          border-radius: 24px;
          border: 1px solid rgba(199,196,216,0.2);
          box-shadow: 0 1px 4px rgba(0,0,0,.04);
          transition: transform .2s, box-shadow .2s;
        }
        .si-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.07); }
        .si-stat-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
        .si-stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .si-ms { font-family: 'Material Symbols Outlined', sans-serif; font-size: 20px; font-weight: 300; }
        .si-stat-badge { font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 4px; letter-spacing: .04em; }
        .si-stat-label { font-size: 10px; font-weight: 700; color: #777587; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 4px; }
        .si-stat-value { font-size: 26px; font-weight: 800; color: #1b1b24; line-height: 1; letter-spacing: -.02em; }
        .si-stat-unit { font-size: 14px; font-weight: 600; color: #777587; }
        .si-mini-bars { display: flex; align-items: flex-end; gap: 3px; height: 32px; margin-top: 16px; }
        .si-mini-bar { width: 4px; border-radius: 99px; }
        .si-progress { height: 8px; background: #f0ecf9; border-radius: 999px; overflow: hidden; margin-top: 16px; }
        .si-progress-fill { height: 100%; border-radius: 999px; }
        .si-progress-note { font-size: 10px; color: #777587; margin-top: 4px; }
        .si-avatar-stack { display: flex; margin-top: 16px; }
        .si-avatar { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #fff; overflow: hidden; margin-left: -6px; flex-shrink: 0; }
        .si-avatar:first-child { margin-left: 0; }
        .si-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .si-avatar-count { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #fff; background: #3525cd; color: #fff; font-size: 8px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-left: -6px; }

        /* ── Main Grid ──────────────────────────────────── */
        .si-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        .si-left { display: flex; flex-direction: column; gap: 20px; }
        .si-right { display: flex; flex-direction: column; gap: 20px; }

        /* ── Cards ──────────────────────────────────────── */
        .si-card { background: #fff; border-radius: 20px; border: 1px solid rgba(199,196,216,0.2); box-shadow: 0 1px 4px rgba(0,0,0,.04); overflow: hidden; }
        .si-card-header { padding: 14px 20px; border-bottom: 1px solid rgba(199,196,216,0.15); display: flex; align-items: center; justify-content: space-between; }
        .si-card-title { font-size: 15px; font-weight: 700; color: #1b1b24; }
        .si-filter-btns { display: flex; gap: 6px; }
        .si-filter-btn { border: 1px solid #eae6f4; background: #fff; border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 600; color: #464555; cursor: pointer; transition: all .15s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .si-filter-btn.active { background: rgba(53,37,205,.08); color: #3525cd; border-color: rgba(53,37,205,.2); }

        /* ── Infrastructure Table ───────────────────────── */
        .si-table { width: 100%; border-collapse: collapse; }
        .si-table thead tr { background: #f5f2ff; }
        .si-table th { padding: 10px 18px; font-size: 10px; font-weight: 700; color: #777587; text-transform: uppercase; letter-spacing: .1em; text-align: left; }
        .si-table td { padding: 13px 18px; font-size: 13px; color: #1b1b24; border-bottom: 1px solid rgba(199,196,216,0.1); vertical-align: middle; }
        .si-table tr:last-child td { border-bottom: none; }
        .si-table tr:hover td { background: #faf9ff; }
        .si-td-name { font-weight: 700; font-size: 13px; }
        .si-td-node { font-size: 11px; color: #777587; margin-top: 2px; }
        .si-td-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; }
        .si-load-bar { width: 88px; height: 6px; background: #f0ecf9; border-radius: 999px; overflow: hidden; }
        .si-load-fill { height: 100%; border-radius: 999px; }
        .si-status-dot { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; }
        .si-dot { width: 7px; height: 7px; border-radius: 50%; animation: si-pulse 2s infinite; }
        @keyframes si-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .si-table-footer { padding: 10px 18px; background: #f5f2ff; text-align: center; }
        .si-view-all { color: #3525cd; font-size: 12px; font-weight: 700; background: transparent; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
        .si-view-all:hover { text-decoration: underline; }

        /* ── Terminal ───────────────────────────────────── */
        .si-terminal-header { padding: 14px 20px; background: #302f39; display: flex; align-items: center; justify-content: space-between; }
        .si-terminal-title { display: flex; align-items: center; gap: 10px; }
        .si-terminal-title h3 { font-size: 15px; font-weight: 700; color: #fff; }
        .si-live-badge { padding: 3px 10px; background: rgba(239,68,68,.2); color: #ef4444; border-radius: 999px; font-size: 10px; font-weight: 700; animation: si-blink 2s infinite; }
        @keyframes si-blink { 0%,100%{opacity:1}50%{opacity:.5} }
        .si-terminal-body { padding: 18px 20px; background: #1e1e2e; color: #a6adc8; font-family: 'SF Mono','Fira Code',monospace; font-size: 13px; line-height: 1.7; }
        .si-incident-block { margin-bottom: 18px; padding: 13px 15px; background: rgba(49,50,68,.5); border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; }
        .si-incident-block-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .si-incident-id { color: #ef4444; font-weight: 700; font-size: 13px; }
        .si-sev-badge { color: #f38ba8; background: rgba(243,139,168,0.1); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
        .si-incident-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px; color: #bac2de; }
        .si-log-line { display: flex; gap: 12px; }
        .si-log-time.success { color: #10b981; }
        .si-log-time.warning { color: #f59e0b; }
        .si-log-time.active { color: #3525cd; }
        .si-log-msg.active { color: #fff; }
        .si-resolution { margin-top: 18px; padding-top: 14px; border-top: 1px solid #45475a; }
        .si-resolution h4 { color: #fff; font-size: 13px; font-weight: 600; margin-bottom: 10px; }
        .si-res-bar-wrap { display: flex; align-items: center; gap: 10px; }
        .si-res-bar { flex: 1; height: 8px; background: #45475a; border-radius: 999px; overflow: hidden; }
        .si-res-fill { height: 100%; background: #10b981; border-radius: 999px; }
        .si-res-pct { color: #10b981; font-weight: 700; font-size: 13px; }
        .si-res-labels { display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px; color: #a6adc8; }

        /* ── Heatmap ────────────────────────────────────── */
        .si-heatmap-section { padding: 16px 20px; }
        .si-heatmap-legend { display: flex; gap: 12px; align-items: center; }
        .si-legend-item { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #777587; }
        .si-legend-dot { width: 11px; height: 11px; border-radius: 2px; }
        .si-region { margin-bottom: 16px; }
        .si-region-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .si-region-name { font-size: 12px; font-weight: 700; color: #1b1b24; }
        .si-region-avg { font-size: 11px; color: #777587; }
        .si-heatmap-row { display: grid; grid-template-columns: repeat(90,1fr); gap: 2px; }
        .si-heatmap-cell { aspect-ratio: 1; border-radius: 2px; cursor: pointer; transition: transform .15s; }
        .si-heatmap-cell:hover { transform: scale(1.6); z-index: 10; position: relative; }
        .si-heatmap-cell.ok { background: rgba(16,185,129,.7); }
        .si-heatmap-cell.warn { background: #f59e0b; }
        .si-heatmap-cell.down { background: #ef4444; }

        /* ── Roadmap Card ───────────────────────────────── */
        .si-roadmap-card { background: #fff; border-radius: 20px; border: 1px solid rgba(199,196,216,0.2); box-shadow: 0 1px 4px rgba(0,0,0,.04); padding: 20px; }
        .si-roadmap-header { display: flex; align-items: center; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid rgba(199,196,216,0.15); margin-bottom: 18px; }
        .si-roadmap-header h3 { font-size: 15px; font-weight: 700; color: #1b1b24; }
        .si-section-label { font-size: 10px; font-weight: 700; color: #777587; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 12px; }
        .si-maint-list { display: flex; flex-direction: column; margin-bottom: 20px; }
        .si-maint-item { display: flex; gap: 12px; }
        .si-maint-date-col { display: flex; flex-direction: column; align-items: center; }
        .si-maint-date { width: 40px; height: 40px; border-radius: 10px; background: #f0ecf9; border: 1px solid rgba(199,196,216,0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all .15s; flex-shrink: 0; }
        .si-maint-item:hover .si-maint-date { background: #3525cd; }
        .si-maint-item:hover .si-maint-month, .si-maint-item:hover .si-maint-day { color: #fff; }
        .si-maint-month { font-size: 9px; font-weight: 700; color: #464555; letter-spacing: .05em; }
        .si-maint-day { font-size: 14px; font-weight: 700; color: #1b1b24; line-height: 1; }
        .si-maint-line { width: 1px; flex: 1; background: rgba(199,196,216,0.2); margin: 4px 0; }
        .si-maint-body { flex: 1; padding-bottom: 14px; }
        .si-maint-title { font-size: 13px; font-weight: 700; color: #1b1b24; }
        .si-maint-desc { font-size: 11px; color: #777587; margin-top: 2px; margin-bottom: 5px; }
        .si-maint-tag { display: inline-block; padding: 2px 7px; background: #f0ecf9; font-size: 10px; font-weight: 700; border-radius: 4px; color: #464555; }
        .si-timeline { display: flex; flex-direction: column; }
        .si-timeline-item { position: relative; padding-left: 20px; padding-bottom: 14px; }
        .si-timeline-item::before { content:''; position:absolute; left:3px; top:6px; width:7px; height:7px; background:#10b981; border-radius:50%; z-index:1; }
        .si-timeline-item::after { content:''; position:absolute; left:6px; top:14px; bottom:0; width:1px; background:rgba(199,196,216,0.25); }
        .si-timeline-item:last-child::after { display:none; }
        .si-timeline-date { font-size: 11px; color: #777587; font-weight: 500; }
        .si-timeline-title { font-size: 13px; font-weight: 700; color: #1b1b24; margin-top: 2px; }
        .si-timeline-desc { font-size: 11px; color: #777587; margin-top: 3px; line-height: 1.5; }
        .si-advisory { margin-top: 18px; padding: 13px 15px; background: rgba(53,37,205,.05); border-radius: 12px; border: 1px solid rgba(53,37,205,.1); }
        .si-advisory-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #3525cd; margin-bottom: 5px; }
        .si-advisory-text { font-size: 11px; color: #464555; line-height: 1.6; }

        /* ── Modal ──────────────────────────────────────── */
        .si-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.3); backdrop-filter:blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:24px; }
        .si-modal { background:#fff; border-radius:20px; width:100%; max-width:520px; box-shadow:0 24px 64px rgba(53,37,205,.18); }
        .si-modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
        .si-modal-header h2 { font-size:17px; font-weight:700; color:#1b1b24; }
        .si-modal-close { background:transparent; border:none; cursor:pointer; color:#aaa; }
        .si-modal-close:hover { color:#1b1b24; }
        .si-modal-form { padding:20px 24px 24px; display:flex; flex-direction:column; gap:16px; }
        .si-fg { display:flex; flex-direction:column; gap:6px; }
        .si-fg label { font-size:12px; font-weight:600; color:#464555; }
        .si-fg input, .si-fg select { border:1px solid #eae6f4; border-radius:8px; padding:9px 12px; font-size:13px; color:#1b1b24; outline:none; font-family:'Plus Jakarta Sans',sans-serif; }
        .si-fg input:focus, .si-fg select:focus { border-color:#3525cd; box-shadow:0 0 0 3px rgba(53,37,205,.08); }
        .si-fg-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .si-chips { display:flex; gap:8px; flex-wrap:wrap; }
        .si-chip { border:1px solid #eae6f4; background:#fff; border-radius:8px; padding:5px 12px; font-size:12px; font-weight:500; color:#555; cursor:pointer; transition:all .15s; font-family:'Plus Jakarta Sans',sans-serif; }
        .si-chip.active { border-color:#3525cd; background:#f0eeff; color:#3525cd; }
        .si-modal-footer { display:flex; gap:10px; justify-content:flex-end; }
        .si-btn-outline { background:transparent; border:1px solid #eae6f4; border-radius:8px; padding:9px 18px; font-size:13px; font-weight:600; color:#555; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; }
        .si-btn-outline:hover { background:#f4f2fb; }
      `}</style>

      <div className="si-page">
        {/* Page Header */}
        <div className="si-page-toprow">
          <div>
            <div className="si-page-heading">Status &amp; Incidents</div>
            <div className="si-page-sub">Global Infrastructure · System Integrity</div>
          </div>
          <button className="si-btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Create Incident
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="si-stats">
          {/* Overall Integrity */}
          <div className="si-stat-card">
            <div className="si-stat-head">
              <div className="si-stat-icon" style={{ background: "rgba(16,185,129,.1)" }}>
                <span className="si-ms" style={{ color: "#10b981" }}>check_circle</span>
              </div>
              <span className="si-stat-badge" style={{ background: "#10b981", color: "#fff" }}>SYSTEM NOMINAL</span>
            </div>
            <div className="si-stat-label">Overall Integrity</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span className="si-stat-value">99.99</span>
              <span className="si-stat-unit">%</span>
            </div>
            <div className="si-mini-bars">
              {[4, 6, 5, 7, 8, 6, 5].map((h, i) => (
                <div key={i} className="si-mini-bar" style={{ height: `${h * 4}px`, background: "#10b981" }} />
              ))}
            </div>
          </div>

          {/* Global Throughput */}
          <div className="si-stat-card">
            <div className="si-stat-head">
              <div className="si-stat-icon" style={{ background: "rgba(53,37,205,.1)" }}>
                <span className="si-ms" style={{ color: "#3525cd" }}>speed</span>
              </div>
            </div>
            <div className="si-stat-label">Global Throughput</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span className="si-stat-value">482.5</span>
              <span className="si-stat-unit">req/s</span>
            </div>
            <div className="si-mini-bars">
              {[{ h: 3, o: 0.4 }, { h: 5, o: 0.6 }, { h: 8, o: 1 }, { h: 6, o: 0.8 }, { h: 4, o: 0.5 }, { h: 7, o: 1 }, { h: 8, o: 0.9 }].map((b, i) => (
                <div key={i} className="si-mini-bar" style={{ height: `${b.h * 4}px`, background: `rgba(53,37,205,${b.o})` }} />
              ))}
            </div>
          </div>

          {/* Security Compliance */}
          <div className="si-stat-card">
            <div className="si-stat-head">
              <div className="si-stat-icon" style={{ background: "rgba(0,103,128,.1)" }}>
                <span className="si-ms" style={{ color: "#006780" }}>verified_user</span>
              </div>
            </div>
            <div className="si-stat-label">Security Compliance</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span className="si-stat-value">99.98</span>
              <span className="si-stat-unit">%</span>
            </div>
            <div className="si-progress">
              <div className="si-progress-fill" style={{ width: "99.98%", background: "#006780" }} />
            </div>
            <div className="si-progress-note">ISO 27001 / SOC2 Type II Standard</div>
          </div>

          {/* Active Incidents */}
          <div className="si-stat-card">
            <div className="si-stat-head">
              <div className="si-stat-icon" style={{ background: "rgba(239,68,68,.1)" }}>
                <span className="si-ms" style={{ color: "#ef4444" }}>warning</span>
              </div>
            </div>
            <div className="si-stat-label">Active Incidents</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span className="si-stat-value" style={{ color: "#ef4444" }}>{String(activeCount).padStart(2, "0")}</span>
              <span className="si-stat-unit">Critical</span>
            </div>
            <div className="si-avatar-stack">
              {[
                "https://lh3.googleusercontent.com/aida-public/AB6AXuACpbU8BWsUowsZqbEqM0YbXu3wKG-oBetJorROTLrA95z_XFc5fkHW4ZOLHclWr3Z7uyEHr-O7tU9QknVFWYDfzX2wWZEpVHVB8Y22qH04uWwLt0T2wctc_9I7-W_P6BTJ00UloDp57XLPqwRwPsCGo0xfpnM6oDm4VJEI8_a1EDrcFYeGQVMYKM23BBnYuveZfIEK1IIvXp9hsl-YCoXdM4Ud0qlmOppGmPocogwNelxKICwCwqhGD8zsWtKEVNptBFLYDjfa3O4",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAIGslquJwd8AGcxVJpRYPVERX-DjJUlrYFSmRePIriiIthQ6v5p7SqfKKBrfzkbCvuiGXi-1qmz_d9vi6aCt3rUeNhEtshWgcTk9NI-PaVoRuVmvXq2DOhg7ew31h0BFe3XrI4ZyIgWVD_S8PJU6DGH_3FSaZydBmtp9QOn_OM2uKU10Qtzhm5sgoEOIW_zr05GTbjBJ54zHF050PkzDbf8FbIBaoUH_Sc1sysLiwaqwTOmVeDJyqu1hk5EQAvGV5pNndWPOFjnyw",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuC9nNuLf8ghPPTc3E3GkJtCyUnMSg6df1LmORfNGOa5UN9hiUwA7OqN37Mq2jOgDsHA2J4QlRvTtO1_mtGAWdz18UZgNH6-_euoCNNVp9WRzxyHJxDTKY2ge4tIVWUgoi84QsCnh_3m1C2J9Yw52czu03xZHAaGOCxWzMIla-78rpdCJfD2DTQAP6Zga37EoEjRvDmPZtHgflWEqJQ2-HNHru2H7qJqnhPi4G04QJ2Oz9KjCmwN1AnpSFWm0TWJYTFm7483Hlfzu-U",
              ].map((src, i) => (
                <div key={i} className="si-avatar"><img src={src} alt="responder" /></div>
              ))}
              <div className="si-avatar-count">+2</div>
            </div>
          </div>
        </div>

        {/* ── Two-Column Grid ── */}
        <div className="si-grid">
          {/* Left */}
          <div className="si-left">
            {/* Infrastructure Health Matrix */}
            <div className="si-card">
              <div className="si-card-header">
                <span className="si-card-title">Infrastructure Health Matrix</span>
                <div className="si-filter-btns">
                  <button className="si-filter-btn">Filter</button>
                  <button className="si-filter-btn active">Live View</button>
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="si-table">
                  <thead>
                    <tr>
                      <th>Service Entity</th>
                      <th>Uptime (24h)</th>
                      <th>Latency</th>
                      <th>Load</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INFRASTRUCTURE.map((row) => (
                      <tr key={row.name}>
                        <td>
                          <div className="si-td-name">{row.name}</div>
                          <div className="si-td-node">{row.node}</div>
                        </td>
                        <td className="si-td-mono">{row.uptime}</td>
                        <td><span style={{ color: row.latencyColor, fontWeight: 600 }}>{row.latency}</span></td>
                        <td>
                          <div className="si-load-bar">
                            <div className="si-load-fill" style={{ width: `${row.load}%`, background: row.latencyColor }} />
                          </div>
                        </td>
                        <td>
                          <span className="si-status-dot" style={{ color: row.statusColor }}>
                            <span className="si-dot" style={{ background: row.statusColor }} />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="si-table-footer">
                <button className="si-view-all">View All 42 Infrastructure Nodes</button>
              </div>
            </div>

            {/* Active Incident Terminal */}
            {incidents.filter(i => i.status !== "resolved").map((inc) => (
              <div key={inc.id} className="si-card">
                <div className="si-terminal-header">
                  <div className="si-terminal-title">
                    <span className="si-ms" style={{ color: "#ef4444" }}>terminal</span>
                    <h3>Active Incident Terminal</h3>
                  </div>
                  <span className="si-live-badge">1 LIVE INCIDENT</span>
                </div>
                <div className="si-terminal-body">
                  <div className="si-incident-block">
                    <div className="si-incident-block-head">
                      <span className="si-incident-id">{inc.id}: {inc.title}</span>
                      <span className="si-sev-badge">SEV-1 CRITICAL</span>
                    </div>
                    <div className="si-incident-meta">
                      <div>Started: {inc.startedAt || "14:02 UTC"}</div>
                      <div>Duration: {inc.duration || "00:42:12"}</div>
                      <div>Primary Responder: {inc.responder || "Sarah Chen (On-Call)"}</div>
                      <div>Affected Region: {inc.region || "us-east-1"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(inc.logs || MOCK_INCIDENTS[0].logs).map((log, i) => (
                      <div key={i} className="si-log-line">
                        <span className={`si-log-time ${log.type}`}>{log.time}</span>
                        <span className={`si-log-msg ${log.type}`}>{log.msg}</span>
                      </div>
                    ))}
                  </div>
                  <div className="si-resolution">
                    <h4>Resolution Progress Tracker</h4>
                    <div className="si-res-bar-wrap">
                      <div className="si-res-bar">
                        <div className="si-res-fill" style={{ width: `${inc.progress || 75}%` }} />
                      </div>
                      <span className="si-res-pct">{inc.progress || 75}%</span>
                    </div>
                    <div className="si-res-labels">
                      <span>Detection</span>
                      <span>Triaged</span>
                      <span style={{ color: "#fff" }}>Mitigation</span>
                      <span style={{ color: "#45475a" }}>Recovery</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 90-Day Uptime Heatmap */}
            <div className="si-card">
              <div className="si-card-header">
                <span className="si-card-title">90-Day Uptime Heatmap</span>
                <div className="si-heatmap-legend">
                  <div className="si-legend-item"><div className="si-legend-dot" style={{ background: "rgba(16,185,129,.7)" }} />100%</div>
                  <div className="si-legend-item"><div className="si-legend-dot" style={{ background: "#f59e0b" }} />Degraded</div>
                  <div className="si-legend-item"><div className="si-legend-dot" style={{ background: "#ef4444" }} />Down</div>
                </div>
              </div>
              <div className="si-heatmap-section">
                {REGIONS.map((region, ri) => (
                  <div key={region.name} className="si-region">
                    <div className="si-region-header">
                      <span className="si-region-name">{region.name}</span>
                      <span className="si-region-avg">Avg: {region.avg}</span>
                    </div>
                    <UptimeBar days={heatmaps[ri]} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Operational Roadmap */}
          <div className="si-right">
            <div className="si-roadmap-card">
              <div className="si-roadmap-header">
                <span className="si-ms" style={{ color: "#3525cd", fontSize: 22 }}>calendar_month</span>
                <h3>Operational Roadmap</h3>
              </div>

              <div className="si-section-label">Upcoming Maintenance</div>
              <div className="si-maint-list">
                {maintenanceRoadmap.map((m, i) => (
                  <div key={m.id} className="si-maint-item">
                    <div className="si-maint-date-col">
                      <div className="si-maint-date">
                        <span className="si-maint-month">{m.month}</span>
                        <span className="si-maint-day">{m.day}</span>
                      </div>
                      {i < maintenanceRoadmap.length - 1 && <div className="si-maint-line" />}
                    </div>
                    <div className="si-maint-body">
                      <div className="si-maint-title">{m.title}</div>
                      <div className="si-maint-desc">{m.desc}</div>
                      <span className="si-maint-tag">{m.tag}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="si-section-label">Recent System Updates</div>
              <div className="si-timeline">
                {MOCK_UPDATES.map((u) => (
                  <div key={u.date} className="si-timeline-item">
                    <div className="si-timeline-date">{u.date}</div>
                    <div className="si-timeline-title">{u.title}</div>
                    <div className="si-timeline-desc">{u.desc}</div>
                  </div>
                ))}
              </div>

              <div className="si-advisory">
                <div className="si-advisory-title">
                  <span className="si-ms" style={{ fontSize: 17 }}>info</span>
                  Security Advisory
                </div>
                <p className="si-advisory-text">
                  System-wide audit scheduled for Nov 1. Ensure all service keys are rotated as per Security Policy SP-42.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <IncidentModal onClose={() => setModalOpen(false)} onCreate={handleCreate} />
      )}
    </>
  );
}
