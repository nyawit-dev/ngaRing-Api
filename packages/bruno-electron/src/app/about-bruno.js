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
            .link {
                display: inline-block;
                padding: 6px 14px;
                background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s;
            }
            .link:hover {
                opacity: 0.9;
            }
        </style>
    </head>
    <body>
      <div class="logo-wrap">
        <svg id="ngaring-logo" width="80" height="80" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="about-cyan-grad" x1="6" y1="6" x2="66" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="55%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="about-accent-grad" x1="16" y1="16" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="62" height="62" rx="17" fill="#111827" stroke="#1E293B" strokeWidth="1.5" />
          <circle cx="36" cy="36" r="23" stroke="url(#about-cyan-grad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="95 50" transform="rotate(-35 36 36)" />
          <circle cx="36" cy="36" r="23" stroke="url(#about-accent-grad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="22 123" transform="rotate(125 36 36)" />
          <circle cx="56.5" cy="24.5" r="3" fill="#00F0FF" />
          <path d="M25 47V25L47 47V25" stroke="url(#about-cyan-grad)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="36" cy="36" r="2" fill="#FFFFFF" />
        </svg>
      </div>
      <h2 class="title">NgaRingApi v${version}</h2>
      <div class="tagline">Local-First API IDE</div>
      <div class="description">
        Fast, Git-friendly API development and testing environment.
      </div>
      <footer class="footer">
          ©${currentYear} NgaRingApi
      </footer>
    </body>
    </html>
  `;
};
