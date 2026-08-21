// Hand-drawn, minimal line icons — no image files, no icon library
// dependency. Each uses currentColor so it inherits whatever text color
// it's placed in, staying consistent with the palette automatically.

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function BookIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5c2-1 5-1 8 0v13c-3-1-6-1-8 0v-13Z" />
      <path d="M20 5.5c-2-1-5-1-8 0v13c3-1 6-1 8 0v-13Z" />
    </svg>
  );
}

export function DropletIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3c3.5 4 6 7.5 6 10.5a6 6 0 1 1-12 0C6 10.5 8.5 7 12 3Z" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  );
}

export function QuizIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.35-1 .8-1 1.7" />
      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function HelpIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H9l-4 3.5V16.5H6c-1.1 0-2-.9-2-2v-9Z" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.35-1 .8-1 1.7" />
      <circle cx="12" cy="15.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
