import React from 'react';

const NgaRingLogo = ({ width = 72, className = '' }) => {
  return (
    <svg
      id="ngaring-logo"
      width={width}
      height={width}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="ngaring-cyan-grad" x1="6" y1="6" x2="66" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="55%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="ngaring-accent-grad" x1="16" y1="16" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      {/* Dark Obsidian Squircle Badge for crisp contrast in any theme */}
      <rect x="5" y="5" width="62" height="62" rx="17" fill="#0B0F17" stroke="#1E293B" strokeWidth="1.5" />

      {/* Outer Orbital Ring (The NgaRing Loop) */}
      <circle
        cx="36"
        cy="36"
        r="23"
        stroke="url(#ngaring-cyan-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="95 50"
        transform="rotate(-35 36 36)"
      />
      <circle
        cx="36"
        cy="36"
        r="23"
        stroke="url(#ngaring-accent-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="22 123"
        transform="rotate(125 36 36)"
      />

      {/* Satellite Node: API Request Packet */}
      <circle cx="56.5" cy="24.5" r="3" fill="#00F0FF" />

      {/* Central Geometric 'N' Monogram */}
      <path
        d="M25 47V25L47 47V25"
        stroke="url(#ngaring-cyan-grad)"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Core Node Pulse */}
      <circle cx="36" cy="36" r="2" fill="#FFFFFF" />
    </svg>
  );
};

export default NgaRingLogo;
