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
        <linearGradient id="cat-cyan-grad" x1="6" y1="6" x2="66" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="cat-ring-grad" x1="16" y1="16" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      {/* Dark Obsidian Squircle Base */}
      <rect x="5" y="5" width="62" height="62" rx="17" fill="#0B0F17" stroke="#1E293B" strokeWidth="1.5" />

      {/* The NgaRing Orbital Loop (Request-Response Orbit) */}
      <circle
        cx="36"
        cy="37"
        r="24"
        stroke="url(#cat-ring-grad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeDasharray="95 50"
        transform="rotate(-30 36 37)"
      />

      {/* Satellite Data Packet Node */}
      <circle cx="58" cy="25" r="2.8" fill="#00F0FF" />

      {/* Cyber-Cat Geometric Head with integrated N-silhouette */}
      <path
        d="M21 47 L21 34 L26 19 L32 27 L40 27 L46 19 L51 34 L51 47 C51 53 44 56.5 36 56.5 C28 56.5 21 53 21 47 Z"
        fill="rgba(6, 182, 212, 0.08)"
        stroke="url(#cat-cyan-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cat Inner Ear Geometric Facets */}
      <path
        d="M26 31 L27 23 L31 28"
        stroke="#38BDF8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46 31 L45 23 L41 28"
        stroke="#38BDF8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Luminous Cyber-Cat Eyes */}
      <line x1="27" y1="38" x2="33" y2="38" stroke="#00F0FF" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="39" y1="38" x2="45" y2="38" stroke="#00F0FF" strokeWidth="2.8" strokeLinecap="round" />

      {/* Central Signal Pulse / Cat Nose */}
      <circle cx="36" cy="44" r="2" fill="#00F0FF" />

      {/* Whisker Data Nodes */}
      <line x1="28" y1="46" x2="19" y2="46" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="46" x2="53" y2="46" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export default NgaRingLogo;
