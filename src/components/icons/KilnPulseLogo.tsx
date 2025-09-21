import * as React from 'react';

export function KilnPulseLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-label="KilnPulse Logo"
      {...props}
    >
      <defs>
        <linearGradient id="emberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.7 }} />
        </linearGradient>
      </defs>
      <path
        d="M50,10 A40,40 0 1 1 10,50"
        stroke="hsl(var(--foreground))"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        transform="rotate(45 50 50)"
      />
      <path
        d="M 25 60 L 35 60 L 40 50 L 50 70 L 60 40 L 65 60 L 75 60"
        stroke="url(#emberGradient)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
