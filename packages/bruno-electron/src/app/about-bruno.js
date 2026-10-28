module.exports = function aboutNgaRingApi({ version }) {
  const currentYear = new Date().getFullYear();
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1, user-scalable=yes">
        <title>About NgaRingApi</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                text-align: center;
                margin: 0;
                padding: 24px 16px;
                background-color: #0b0f17;
                color: #e2e8f0;
            }
            .logo-wrap {
                margin: 0 auto 12px;
                display: flex;
                justify-content: center;
            }
            .title {
                font-size: 20px;
                margin: 8px 0 4px;
                font-weight: 700;
                color: #f8fafc;
                letter-spacing: -0.2px;
            }
            .tagline {
                font-size: 12px;
                color: #00f0ff;
                margin: 0 0 16px;
                font-weight: 500;
            }
            .description {
                font-size: 12px;
                color: #94a3b8;
                margin: 0 0 18px;
                line-height: 1.5;
            }
            .footer {
                margin-top: 14px;
                font-size: 11px;
                color: #64748b;
            }
        </style>
    </head>
    <body>
      <div class="logo-wrap">
        <svg id="ngaring-logo" width="80" height="80" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="about-cat-cyan" x1="6" y1="6" x2="66" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="about-cat-ring" x1="16" y1="16" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="62" height="62" rx="17" fill="#111827" stroke="#1E293B" strokeWidth="1.5" />
          <circle cx="36" cy="37" r="24" stroke="url(#about-cat-ring)" strokeWidth="2.8" strokeLinecap="round" strokeDasharray="95 50" transform="rotate(-30 36 37)" />
          <circle cx="58" cy="25" r="2.8" fill="#00F0FF" />
          <path d="M21 47 L21 34 L26 19 L32 27 L40 27 L46 19 L51 34 L51 47 C51 53 44 56.5 36 56.5 C28 56.5 21 53 21 47 Z" fill="rgba(6, 182, 212, 0.08)" stroke="url(#about-cat-cyan)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 31 L27 23 L31 28" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M46 31 L45 23 L41 28" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="27" y1="38" x2="33" y2="38" stroke="#00F0FF" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="39" y1="38" x2="45" y2="38" stroke="#00F0FF" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="36" cy="44" r="2" fill="#00F0FF" />
          <line x1="28" y1="46" x2="19" y2="46" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
          <line x1="44" y1="46" x2="53" y2="46" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 class="title">NgaRingApi v${version}</h2>
      <div class="tagline">Local-First API IDE</div>
      <div class="description">
        Fast, Git-friendly API development and testing environment.
      </div>
      <footer class="footer">
          ©${currentYear} nyawit.dev
      </footer>
    </body>
    </html>
  `;
};
