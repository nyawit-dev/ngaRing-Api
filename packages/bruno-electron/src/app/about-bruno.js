module.exports = function aboutNgaRingApi({ version }) {
  const currentYear = new Date().getFullYear();
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>About NgaRingApi</title>
        <style>
            :root {
                --bg: #0b0f17;
                --surface: #111827;
                --surface-hover: #1e293b;
                --border: #1e293b;
                --border-accent: #334155;
                --text-main: #f8fafc;
                --text-muted: #94a3b8;
                --text-dim: #64748b;
                --cyan: #00f0ff;
                --cyan-hover: #38bdf8;
                --amber: #facc15;
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: var(--bg);
                color: var(--text-main);
                padding: 24px 20px 20px;
                line-height: 1.5;
                overflow-x: hidden;
            }
            .header-wrap {
                text-align: center;
                margin-bottom: 20px;
            }
            .logo-wrap {
                margin: 0 auto 10px;
                display: flex;
                justify-content: center;
                filter: drop-shadow(0 0 16px rgba(0, 240, 255, 0.25));
            }
            .app-title {
                font-size: 22px;
                font-weight: 700;
                color: var(--text-main);
                letter-spacing: -0.3px;
                margin-bottom: 4px;
            }
            .version-pill {
                display: inline-block;
                font-size: 11px;
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 9999px;
                background: rgba(0, 240, 255, 0.12);
                color: var(--cyan);
                border: 1px solid rgba(0, 240, 255, 0.3);
                margin-bottom: 6px;
            }
            .tagline {
                font-size: 13px;
                color: var(--text-muted);
                font-weight: 400;
            }
            .content-card {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 10px;
                padding: 16px;
                margin-bottom: 14px;
                text-align: left;
            }
            .card-title {
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.6px;
                color: var(--cyan);
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .desc-text {
                font-size: 12px;
                color: var(--text-muted);
                line-height: 1.6;
                margin-bottom: 10px;
            }
            .desc-text a {
                color: var(--cyan);
                text-decoration: none;
                font-weight: 500;
            }
            .desc-text a:hover {
                text-decoration: underline;
            }
            .feature-list {
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .feature-item {
                font-size: 11.5px;
                color: #cbd5e1;
                display: flex;
                align-items: flex-start;
                gap: 8px;
                line-height: 1.4;
            }
            .feature-icon {
                flex-shrink: 0;
                margin-top: 1px;
            }
            .links-group {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 8px;
            }
            .link-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 6px;
                background: var(--surface-hover);
                color: #e2e8f0;
                border: 1px solid var(--border-accent);
                font-size: 11.5px;
                font-weight: 500;
                text-decoration: none;
                transition: all 0.15s ease;
            }
            .link-btn:hover {
                background: #334155;
                color: var(--cyan);
                border-color: var(--cyan);
                transform: translateY(-1px);
            }
            .link-btn.primary {
                background: rgba(0, 240, 255, 0.1);
                color: var(--cyan);
                border-color: rgba(0, 240, 255, 0.4);
            }
            .link-btn.primary:hover {
                background: rgba(0, 240, 255, 0.2);
            }
            .footer-info {
                text-align: center;
                font-size: 11px;
                color: var(--text-dim);
                margin-top: 16px;
                line-height: 1.5;
            }
        </style>
    </head>
    <body>
        <div class="header-wrap">
            <div class="logo-wrap">
                <svg id="ngaring-logo" width="68" height="68" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="about-cat-cyan" x1="6" y1="6" x2="66" y2="66" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stop-color="#00F0FF" />
                            <stop offset="50%" stop-color="#06B6D4" />
                            <stop offset="100%" stop-color="#0284C7" />
                        </linearGradient>
                        <linearGradient id="about-cat-ring" x1="16" y1="16" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stop-color="#38BDF8" />
                            <stop offset="100%" stop-color="#6366F1" />
                        </linearGradient>
                    </defs>
                    <rect x="5" y="5" width="62" height="62" rx="17" fill="#111827" stroke="#1E293B" stroke-width="1.5" />
                    <circle cx="36" cy="37" r="24" stroke="url(#about-cat-ring)" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="95 50" transform="rotate(-30 36 37)" />
                    <circle cx="58" cy="25" r="2.8" fill="#00F0FF" />
                    <path d="M21 47 L21 34 L26 19 L32 27 L40 27 L46 19 L51 34 L51 47 C51 53 44 56.5 36 56.5 C28 56.5 21 53 21 47 Z" fill="rgba(6, 182, 212, 0.08)" stroke="url(#about-cat-cyan)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M26 31 L27 23 L31 28" stroke="#38BDF8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M46 31 L45 23 L41 28" stroke="#38BDF8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    <line x1="27" y1="38" x2="33" y2="38" stroke="#00F0FF" stroke-width="2.8" stroke-linecap="round" />
                    <line x1="39" y1="38" x2="45" y2="38" stroke="#00F0FF" stroke-width="2.8" stroke-linecap="round" />
                    <circle cx="36" cy="44" r="2" fill="#00F0FF" />
                    <line x1="28" y1="46" x2="19" y2="46" stroke="#06B6D4" stroke-width="2" stroke-linecap="round" />
                    <line x1="44" y1="46" x2="53" y2="46" stroke="#06B6D4" stroke-width="2" stroke-linecap="round" />
                </svg>
            </div>
            <h1 class="app-title">NgaRingApi</h1>
            <div class="version-pill">Versi ${version}</div>
            <p class="tagline">Local-First, Git-Friendly API IDE & Development Client</p>
        </div>

        <div class="content-card">
            <div class="card-title">
                <span>⚡</span>
                <span>Asal-Usul & Atribusi Proyek Upstream</span>
            </div>
            <p class="desc-text">
                <strong>NgaRingApi</strong> adalah aplikasi pengujian dan pengembangan API desktop yang dibangun dan dimodifikasi secara ekstensif berbasis repositori open-source upstream 
                <a href="https://github.com/usebruno/bruno" target="_blank" rel="noopener">Bruno (usebruno/bruno)</a>, yang diciptakan oleh Anoop M D dan para kontributor komunitas global.
            </p>
            <p class="desc-text">
                Proyek ini menghargai dan meneruskan semangat open-source Bruno dengan menyempurnakan fitur lokal, alur rilis mandiri, pengalaman pengguna, dan stabilitas operasional.
            </p>
        </div>

        <div class="content-card">
            <div class="card-title">
                <span>🚀</span>
                <span>Peningkatan & Fitur Khusus NgaRingApi</span>
            </div>
            <ul class="feature-list">
                <li class="feature-item">
                    <span class="feature-icon">🔄</span>
                    <div><strong>Smart Auto-Updater</strong>: Sistem pembaruan terpadu satu titik di pojok kanan bawah dengan konfirmasi unduhan, indikator kecepatan & ETA waktu nyata, serta pemasangan otomatis.</div>
                </li>
                <li class="feature-item">
                    <span class="feature-icon">📢</span>
                    <div><strong>Multi-Source Notifications</strong>: Menerima pengumuman resmi dari kanal nyawit.dev sekaligus mempertahankan feed komunitas Bruno upstream.</div>
                </li>
                <li class="feature-item">
                    <span class="feature-icon">📁</span>
                    <div><strong>Local-First & Git-Friendly</strong>: Seluruh koleksi API tersimpan sebagai berkas teks biasa di komputer Anda, tanpa ketergantungan cloud tertutup.</div>
                </li>
                <li class="feature-item">
                    <span class="feature-icon">🎨</span>
                    <div><strong>Obsidian Catppuccin Aesthetic</strong>: Desain antarmuka gelap yang nyaman untuk sesi coding panjang.</div>
                </li>
            </ul>
        </div>

        <div class="content-card">
            <div class="card-title">
                <span>🔗</span>
                <span>Tautan & Repositori Resmi</span>
            </div>
            <div class="links-group">
                <a class="link-btn primary" href="https://github.com/nyawit-dev/ngaRing-Api" target="_blank" rel="noopener">
                    <span>🐙</span>
                    <span>GitHub NgaRingApi</span>
                </a>
                <a class="link-btn" href="https://github.com/usebruno/bruno" target="_blank" rel="noopener">
                    <span>📦</span>
                    <span>Upstream Bruno Repo</span>
                </a>
                <a class="link-btn" href="https://github.com/nyawit-dev/ngaRing-Api/issues" target="_blank" rel="noopener">
                    <span>🐛</span>
                    <span>Laporkan Issue</span>
                </a>
            </div>
        </div>

        <div class="footer-info">
            Lisensi Open Source di bawah <strong>MIT License</strong>.<br>
            Hak Cipta Modifikasi © ${currentYear} <strong>nyawit.dev</strong>.<br>
            Hak Cipta Proyek Asli © Anoop M D & Kontributor Bruno.
        </div>
    </body>
    </html>
  `;
};
