import { router } from "@/.expo/types/router";
import { useState } from "react";
import {
    mockJobs,
    mockPaymentDue,
    mockStats,
    revenueData,
} from "../../data/mock";
// import type { Screen } from "../App";

type DashTab = "overview" | "dues";

function BarChart({ data }: { data: { day: string; amount: number }[] }) {
  const max = Math.max(...data.map((d) => d.amount));
  const barW = 26;
  const gap = 11;
  const h = 68;
  const svgW = data.length * barW + (data.length - 1) * gap;

  return (
    <svg width={svgW} height={h} viewBox={`0 0 ${svgW} ${h}`}>
      <defs>
        <linearGradient id="tealBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00d4aa" />
          <stop offset="100%" stopColor="#00a884" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.amount / max) * (h - 16));
        const x = i * (barW + gap);
        const y = h - barH - 14;
        const isToday = i === data.length - 1;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={6}
              fill={isToday ? "url(#tealBar)" : "rgba(255,255,255,0.06)"}
            />
            <text
              x={x + barW / 2}
              y={h - 1}
              textAnchor="middle"
              fill={isToday ? "#00d4aa" : "#2a3040"}
              fontSize="9"
              fontFamily="Inter, sans-serif"
              fontWeight={isToday ? "700" : "400"}
            >
              {d.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const jobStatusMeta: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  "in-progress": {
    label: "In Progress",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
  },
  "waiting-parts": {
    label: "Waiting Parts",
    color: "#ff6b35",
    bg: "rgba(255,107,53,0.1)",
  },
  completed: {
    label: "Completed",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
  },
  cancelled: {
    label: "Cancelled",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
  },
};

// interface DashboardProps {
//   onNav: (s: Screen) => void;
// }

export default function Dashboard() {
  const [tab, setTab] = useState<DashTab>("overview");

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const activeJobs = mockJobs.filter(
    (j) => j.status === "in-progress" || j.status === "waiting-parts",
  );
  const totalDue = mockPaymentDue.reduce((s, d) => s + d.amount, 0);
  const overdueItems = mockPaymentDue.filter((d) => d.daysOverdue > 0);

  return (
    <div className="h-full flex flex-col" style={{ background: "#0a0b0e" }}>
      {/* ── Greeting header ── */}
      <div
        className="px-4 pt-4 pb-4 flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.01)" }}
      >
        <p className="text-xs mb-0.5" style={{ color: "#3a4154" }}>
          {dateStr}
        </p>
        <h2
          className="text-xl font-bold"
          style={{ color: "#e8eaf0", letterSpacing: "-0.02em" }}
        >
          {greeting}, Alex
        </h2>
      </div>

      {/* ── Tab switcher ── */}
      <div
        className="flex-shrink-0 flex px-4 gap-1 pb-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {(
          [
            { id: "overview" as DashTab, label: "Overview" },
            {
              id: "dues" as DashTab,
              label: "Payment Due",
              badge: mockPaymentDue.length,
            },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-150"
            style={{
              background: tab === t.id ? "#00d4aa" : "rgba(255,255,255,0.04)",
              color: tab === t.id ? "#080a0d" : "#6b7a94",
              border:
                tab === t.id ? "none" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {t.label}
            {"badge" in t && t.badge != null && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background:
                    tab === t.id
                      ? "rgba(0,0,0,0.2)"
                      : overdueItems.length > 0
                        ? "rgba(239,68,68,0.2)"
                        : "rgba(255,255,255,0.1)",
                  color:
                    tab === t.id
                      ? "#080a0d"
                      : overdueItems.length > 0
                        ? "#ef4444"
                        : "#9aa3b8",
                }}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto">
        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div
            className="px-4 py-4 space-y-4"
            style={{ paddingBottom: "1.5rem" }}
          >
            {/* Revenue card */}
            <div
              className="rounded-3xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0f1520 0%, #0a1018 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Glow */}
              <div
                className="absolute top-0 right-0 pointer-events-none"
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)",
                  transform: "translate(30%, -30%)",
                }}
              />

              <div className="flex items-start justify-between mb-4">
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "#4a5568" }}
                  >
                    Today's Revenue
                  </p>
                  <p
                    className="text-4xl font-bold"
                    style={{
                      color: "#e8eaf0",
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    ${mockStats.todayRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#10b981" }}
                    >
                      +12.4%
                    </span>
                    <span className="text-xs" style={{ color: "#3a4154" }}>
                      vs yesterday
                    </span>
                  </div>
                </div>
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(0,212,170,0.1)",
                    border: "1px solid rgba(0,212,170,0.18)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#00d4aa"
                    strokeWidth="1.8"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <BarChart data={revenueData} />
                <div className="text-right ml-4">
                  <p className="text-xs" style={{ color: "#3a4154" }}>
                    This week
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{
                      color: "#00d4aa",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    ${mockStats.weekRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Due banner */}
            {overdueItems.length > 0 && (
              <button
                onClick={() => setTab("dues")}
                className="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-all"
                style={{
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.18)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(239,68,68,0.15)" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#ef4444" }}
                  >
                    {overdueItems.length} overdue payment
                    {overdueItems.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs" style={{ color: "#9aa3b8" }}>
                    Total outstanding:{" "}
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "#ef4444",
                      }}
                    >
                      ${totalDue}
                    </span>
                  </p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            {/* Active jobs */}
            {activeJobs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "#e8eaf0" }}
                  >
                    Active Jobs
                  </h3>
                  <button
                    onClick={() => router.push("/jobs")}
                    className="text-xs font-semibold"
                    style={{ color: "#00d4aa" }}
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-2.5">
                  {activeJobs.map((job) => {
                    const meta = jobStatusMeta[job.status];
                    return (
                      <div
                        key={job.id}
                        className="rounded-2xl px-4 py-3.5"
                        style={{
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "#e8eaf0" }}
                            >
                              {job.customer}
                            </p>
                            <p className="text-xs" style={{ color: "#4a5568" }}>
                              {job.vehicle}
                            </p>
                          </div>
                          <span
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs" style={{ color: "#6b7a94" }}>
                            {job.service}
                          </p>
                          <p
                            className="text-sm font-bold"
                            style={{
                              color: "#e8eaf0",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            ${job.total}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div>
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "#e8eaf0" }}
              >
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    label: "New Job Order",
                    screen: "/jobs",
                    color: "#00d4aa",
                    bg: "rgba(0,212,170,0.1)",
                    border: "rgba(0,212,170,0.18)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Create Invoice",
                    screen: "/pos",
                    color: "#3b82f6",
                    bg: "rgba(59,130,246,0.1)",
                    border: "rgba(59,130,246,0.18)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                    ),
                  },
                  {
                    label: "Check Stock",
                    screen: "/inventory",
                    color: "#f59e0b",
                    bg: "rgba(245,158,11,0.1)",
                    border: "rgba(245,158,11,0.18)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    ),
                  },
                  {
                    label: "Add Customer",
                    screen: "/customers",
                    color: "#8b5cf6",
                    bg: "rgba(139,92,246,0.1)",
                    border: "rgba(139,92,246,0.18)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    ),
                  },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={() => router.push}
                    className="rounded-2xl p-4 flex flex-col gap-3 text-left transition-all duration-150"
                    style={{
                      background: a.bg,
                      border: `1px solid ${a.border}`,
                    }}
                  >
                    <span style={{ color: a.color }}>{a.icon}</span>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: a.color }}
                    >
                      {a.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PAYMENT DUE TAB ── */}
        {tab === "dues" && (
          <div
            className="px-4 py-4 space-y-3"
            style={{ paddingBottom: "1.5rem" }}
          >
            {/* Summary */}
            <div
              className="rounded-3xl p-5"
              style={{
                background: "linear-gradient(135deg, #1a0a0a 0%, #120808 100%)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "rgba(239,68,68,0.6)" }}
                  >
                    Total Outstanding
                  </p>
                  <p
                    className="text-3xl font-bold"
                    style={{
                      color: "#e8eaf0",
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    ${totalDue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#ef4444" }}
                      >
                        {overdueItems.length}
                      </span>
                      <span
                        className="text-xs ml-1"
                        style={{ color: "#4a5568" }}
                      >
                        overdue
                      </span>
                    </div>
                    <div
                      className="w-px h-3"
                      style={{ background: "rgba(255,255,255,0.1)" }}
                    />
                    <div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#f59e0b" }}
                      >
                        {
                          mockPaymentDue.filter((d) => d.daysOverdue === 0)
                            .length
                        }
                      </span>
                      <span
                        className="text-xs ml-1"
                        style={{ color: "#4a5568" }}
                      >
                        due today
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Due items */}
            <div className="space-y-2.5">
              {mockPaymentDue.map((due) => {
                const urgencyColor =
                  due.daysOverdue === 0
                    ? "#f59e0b"
                    : due.daysOverdue <= 7
                      ? "#ef4444"
                      : "#dc2626";
                const urgencyBg =
                  due.daysOverdue === 0
                    ? "rgba(245,158,11,0.1)"
                    : "rgba(239,68,68,0.1)";
                const urgencyBorder =
                  due.daysOverdue === 0
                    ? "rgba(245,158,11,0.2)"
                    : "rgba(239,68,68,0.15)";

                return (
                  <div
                    key={due.id}
                    className="rounded-2xl px-4 py-4"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "#e8eaf0" }}
                        >
                          {due.customer}
                        </p>
                        <p className="text-xs" style={{ color: "#4a5568" }}>
                          {due.vehicle}
                        </p>
                      </div>
                      <p
                        className="text-lg font-bold"
                        style={{
                          color: urgencyColor,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        ${due.amount}
                      </p>
                    </div>

                    {/* Services list */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {due.services.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            color: "#6b7a94",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Status row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: urgencyBg,
                            color: urgencyColor,
                            border: `1px solid ${urgencyBorder}`,
                          }}
                        >
                          {due.daysOverdue === 0
                            ? "Due Today"
                            : `${due.daysOverdue}d overdue`}
                        </span>
                        <span className="text-xs" style={{ color: "#3a4154" }}>
                          {due.id}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                          style={{
                            background: "rgba(59,130,246,0.1)",
                            color: "#3b82f6",
                            border: "1px solid rgba(59,130,246,0.18)",
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.22 10.14 19.79 19.79 0 011.17 1.5 2 2 0 013.17 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 7.91a16 16 0 006.22 6.22l1.47-1.47a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                          </svg>
                          Call
                        </button>
                        <button
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                          style={{
                            background: "rgba(0,212,170,0.1)",
                            color: "#00d4aa",
                            border: "1px solid rgba(0,212,170,0.18)",
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
