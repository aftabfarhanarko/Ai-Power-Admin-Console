import React from "react";

export const glassCard =
  "border border-white/[0.08] bg-[rgba(255,255,255,0.03)] shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[20px]";

export const monoTextStyle = { fontFamily: '"JetBrains Mono", monospace' };

export const MaterialIcon = ({
  children,
  className = "",
  filled = false,
}) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 24`,
    }}
  >
    {children}
  </span>
);

export const SectionEyebrow = ({ children, className = "" }) => (
  <span
    className={`text-[11px] font-semibold uppercase tracking-[0.2em] text-[#cabeff] ${className}`}
    style={monoTextStyle}
  >
    {children}
  </span>
);

export const PageShell = ({ children, className = "" }) => (
  <div className={`space-y-8 pb-12 ${className}`}>{children}</div>
);

export const PageIntro = ({
  eyebrow,
  title,
  description,
  actions,
  titleClassName = "",
}) => (
  <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
    <div className="max-w-3xl">
      {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
      <h1
        className={`mt-2 text-[48px] font-black leading-[1.05] tracking-[-0.03em] text-[#eaf1ff] ${titleClassName}`}
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-[#c9c4d0]">
          {description}
        </p>
      ) : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-4">{actions}</div> : null}
  </div>
);

export const ActionButton = ({
  children,
  variant = "secondary",
  className = "",
  ...props
}) => {
  const variants = {
    primary:
      "bg-[#e6deff] text-[#1c1148] hover:scale-[1.03] shadow-[0_0_30px_rgba(230,222,255,0.2)]",
    secondary:
      `${glassCard} text-[#eaf1ff] hover:bg-[#282a2e]`,
    subtle:
      "border border-white/[0.08] bg-[#1d2023] text-[#eaf1ff] hover:bg-[#282a2e]",
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-all active:scale-[0.97] ${variants[variant]} ${className}`}
      style={monoTextStyle}
      {...props}
    >
      {children}
    </button>
  );
};

export const StatBadge = ({ children, colorClassName = "text-[#cabeff]" }) => (
  <span
    className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${colorClassName}`}
    style={monoTextStyle}
  >
    {children}
  </span>
);

export const MetricCard = ({
  label,
  value,
  meta,
  icon,
  iconWrapClassName,
  accentClassName = "text-[#e6deff]",
  path,
  badge,
}) => (
  <div
    className={`group relative overflow-hidden rounded-[28px] p-6 transition-all duration-300 hover:-translate-y-1 ${glassCard}`}
  >
    <div className="mb-4 flex items-start justify-between gap-4">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${iconWrapClassName}`}
      >
        <MaterialIcon className="text-[24px]" filled>
          {icon}
        </MaterialIcon>
      </div>
      <div className="text-right">
        <p
          className="text-[10px] uppercase tracking-[0.18em] text-[#938f9a]"
          style={monoTextStyle}
        >
          {label}
        </p>
        {meta ? <p className={`mt-1 text-xs font-bold ${accentClassName}`}>{meta}</p> : null}
      </div>
    </div>
    <div className="text-[36px] font-black leading-none tracking-[-0.03em] text-[#eaf1ff]">
      {value}
    </div>
    {badge ? <div className="mt-3">{badge}</div> : null}
    {path ? (
      <div className={`mt-6 h-12 w-full opacity-40 ${accentClassName}`}>
        <svg
          className="h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 20"
        >
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ) : null}
  </div>
);

export const InfoPanel = ({
  title,
  subtitle,
  action,
  children,
  className = "",
}) => (
  <section className={`rounded-[28px] p-6 ${glassCard} ${className}`}>
    {(title || subtitle || action) && (
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          {title ? (
            <h2 className="text-[22px] font-bold text-[#eaf1ff]">{title}</h2>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-sm text-[#c9c4d0]">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export const SearchInput = ({ placeholder = "Search...", className = "" }) => (
  <div
    className={`relative flex items-center rounded-full border border-white/[0.08] bg-[#1d2023] px-4 py-2 ${className}`}
  >
    <MaterialIcon className="mr-2 text-[18px] text-[#938f9a]">search</MaterialIcon>
    <input
      className="w-full border-none bg-transparent text-sm text-[#eaf1ff] outline-none placeholder:text-[#938f9a]"
      placeholder={placeholder}
      type="text"
    />
  </div>
);

export const DataTable = ({
  columns,
  rows,
  footer,
  className = "",
}) => (
  <div className={`overflow-hidden rounded-[28px] ${glassCard} ${className}`}>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-white/[0.03]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-[#938f9a] ${column.className || ""}`}
                style={monoTextStyle}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.08]">
          {rows.map((row, rowIndex) => (
            <tr
              key={row.key || rowIndex}
              className="transition-colors hover:bg-white/[0.03]"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-5 align-middle text-sm text-[#eaf1ff] ${column.cellClassName || ""}`}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {footer ? (
      <div className="border-t border-white/[0.08] bg-white/[0.02] px-6 py-4">
        {footer}
      </div>
    ) : null}
  </div>
);

export const MiniProgress = ({
  value,
  colorClassName = "bg-[#e6deff]",
  trackClassName = "bg-white/10",
}) => (
  <div className={`h-1.5 w-full overflow-hidden rounded-full ${trackClassName}`}>
    <div className={`h-full ${colorClassName}`} style={{ width: `${value}%` }} />
  </div>
);

export const DotStatus = ({
  label,
  dotClassName = "bg-[#4ade80]",
  textClassName = "text-[#4ade80]",
}) => (
  <div className={`inline-flex items-center gap-2 text-xs font-bold ${textClassName}`}>
    <span className={`h-2 w-2 rounded-full ${dotClassName}`} />
    <span>{label}</span>
  </div>
);
