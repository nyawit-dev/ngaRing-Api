import React, { useState, useEffect } from 'react';
import {
  IconSpeakerphone,
  IconBrandTwitter,
  IconBrandGithub,
  IconBrandDiscord,
  IconBrandLinkedin,
  IconBook,
  IconExternalLink,
  IconRefresh,
  IconBell,
  IconCheck,
  IconInfoCircle,
  IconGitFork,
  IconDeviceFloppy
} from '@tabler/icons';
import toast from 'react-hot-toast';
import StyledWrapper from './StyledWrapper';
import { useTranslation } from 'react-i18next';
import { version } from '../../../../package.json';

const SUPPORT_GROUPS = [
  {
    key: 'help',
    label: 'SUPPORT.HELP',
    links: [
      {
        key: 'documentation',
        icon: IconBook,
        url: 'https://github.com/nyawit-dev/ngaRing-Api#readme',
        label: 'COMMON.DOCUMENTATION',
        description: 'SUPPORT.DOCUMENTATION_DESCRIPTION'
      },
      {
        key: 'report-issues',
        icon: IconSpeakerphone,
        url: 'https://github.com/nyawit-dev/ngaRing-Api/issues',
        label: 'COMMON.REPORT_ISSUES',
        description: 'SUPPORT.REPORT_ISSUES_DESCRIPTION'
      }
    ]
  },
  {
    key: 'community',
    label: 'SUPPORT.COMMUNITY',
    links: [
      {
        key: 'github',
        icon: IconBrandGithub,
        url: 'https://github.com/nyawit-dev/ngaRing-Api',
        label: 'COMMON.GITHUB',
        description: 'SUPPORT.GITHUB_DESCRIPTION'
      },
      {
        key: 'upstream-bruno',
        icon: IconGitFork,
        url: 'https://github.com/usebruno/bruno',
        label: 'Upstream Bruno Repository',
        description: 'Repositori open-source upstream asli yang menjadi basis fondasi NgaRingApi.'
      },
      {
        key: 'discord',
        icon: IconBrandDiscord,
        url: 'https://discord.com/invite/KgcZUncpjq',
        label: 'COMMON.DISCORD',
        description: 'SUPPORT.DISCORD_DESCRIPTION'
      },
      {
        key: 'twitter',
        icon: IconBrandTwitter,
        url: 'https://twitter.com/use_bruno',
        label: 'COMMON.TWITTER',
        description: 'SUPPORT.TWITTER_DESCRIPTION'
      },
      {
        key: 'linkedin',
        icon: IconBrandLinkedin,
        url: 'https://in.linkedin.com/company/usebruno',
        label: 'COMMON.LINKEDIN',
        description: 'SUPPORT.LINKEDIN_DESCRIPTION'
      }
    ]
  }
];

const DEFAULT_NGARING_FEED = 'https://raw.githubusercontent.com/nyawit-dev/ngaRing-Api/main/notifications.json';

const Support = () => {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
  const [updaterInfo, setUpdaterInfo] = useState({
    status: 'idle',
    lastCheckedAt: null,
    availableVersion: null
  });

  const [notifConfig, setNotifConfig] = useState({
    enableBruno: true,
    enableCustom: true,
    customUrl: DEFAULT_NGARING_FEED
  });
  const [savingNotif, setSavingNotif] = useState(false);
  const [refreshingNotif, setRefreshingNotif] = useState(false);

  useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('updater:get-status')
        .then((state) => {
          if (state) setUpdaterInfo(state);
        })
        .catch(() => {});

      window.ipcRenderer.invoke('notifications:get-config')
        .then((cfg) => {
          if (cfg) {
            setNotifConfig({
              enableBruno: cfg.enableBruno !== false,
              enableCustom: cfg.enableCustom !== false,
              customUrl: cfg.customUrl || DEFAULT_NGARING_FEED
            });
          }
        })
        .catch(() => {});

      const removeListener = window.ipcRenderer.on('main:updater-status', (state) => {
        if (state) setUpdaterInfo(state);
      });

      return () => {
        if (typeof removeListener === 'function') removeListener();
      };
    }
  }, []);

  const handleCheckUpdate = (e) => {
    e.preventDefault();
    if (window.ipcRenderer) {
      setChecking(true);
      window.ipcRenderer.invoke('updater:check-for-updates')
        .finally(() => {
          setTimeout(() => setChecking(false), 1200);
        });
    }
  };

  const handleOpenReleasePage = () => {
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('updater:open-download-page', updaterInfo.availableVersion);
    }
  };

  const handleSaveNotifConfig = async () => {
    if (!window.ipcRenderer) return;
    setSavingNotif(true);
    try {
      await window.ipcRenderer.invoke('notifications:save-config', notifConfig);
      toast.success('Pengaturan feed notifikasi berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan: ' + (err?.message || 'Error'));
    } finally {
      setSavingNotif(false);
    }
  };

  const handleRefreshNotif = async () => {
    if (!window.ipcRenderer) return;
    setRefreshingNotif(true);
    try {
      await window.ipcRenderer.invoke('notifications:refresh');
      toast.success('Notifikasi berhasil dimuat ulang!');
    } catch (err) {
      toast.error('Gagal memuat notifikasi: ' + (err?.message || 'Error'));
    } finally {
      setTimeout(() => setRefreshingNotif(false), 600);
    }
  };

  const formatLastChecked = (isoString) => {
    if (!isoString) return 'Belum diperiksa di sesi ini';
    try {
      const d = new Date(isoString);
      return `Terakhir diperiksa: ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Baru saja diperiksa';
    }
  };

  return (
    <StyledWrapper className="w-full">
      <div className="section-header">Support, Updates & Attribution</div>

      {/* 1. Software Updates */}
      <section className="support-group mb-4" aria-labelledby="support-updates-label">
        <h3 className="support-group-label select-none" id="support-updates-label">
          Software Updates & Version Delivery
        </h3>
        <div className="support-card p-3.5 flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                NgaRingApi Desktop v{version}
                {updaterInfo.availableVersion && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Update v{updaterInfo.availableVersion} Tersedia
                  </span>
                )}
              </span>
              <span className="text-xs text-muted">
                {formatLastChecked(updaterInfo.lastCheckedAt)} • Kanal Rilis Resmi GitHub nyawit-dev
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-secondary flex items-center gap-1.5 text-xs"
                onClick={handleOpenReleasePage}
                title="Buka halaman rilis di GitHub"
              >
                <IconExternalLink size={13} />
                <span>Changelog</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-secondary flex items-center gap-1.5 text-xs"
                onClick={handleCheckUpdate}
                disabled={checking}
              >
                <IconRefresh size={13} className={checking ? 'animate-spin' : ''} />
                <span>{checking ? 'Memeriksa...' : 'Check for Updates'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Notification Channels & Feed Settings */}
      <section className="support-group mb-4" aria-labelledby="support-notifs-label">
        <h3 className="support-group-label select-none" id="support-notifs-label">
          Kanal & Feed Notifikasi Aplikasi
        </h3>
        <div className="support-card p-4 flex flex-col gap-3.5">
          <p className="text-xs text-muted leading-relaxed">
            NgaRingApi mendukung penerimaan notifikasi dari dua sumber: feed pengumuman resmi dari nyawit.dev serta feed komunitas upstream Bruno. Anda dapat mengaktifkan keduanya atau mengatur URL feed kustom Anda sendiri.
          </p>

          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 rounded text-cyan-500 focus:ring-0 bg-slate-800 border-slate-700 cursor-pointer"
                checked={notifConfig.enableCustom}
                onChange={(e) => setNotifConfig({ ...notifConfig, enableCustom: e.target.checked })}
              />
              <span className="text-slate-200 font-medium">Aktifkan Notifikasi NgaRingApi / Kustom</span>
            </label>

            {notifConfig.enableCustom && (
              <div className="flex flex-col gap-1 pl-6">
                <span className="text-[11px] text-muted">URL Feed Notifikasi JSON:</span>
                <input
                  type="text"
                  className="textbox w-full text-xs px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  value={notifConfig.customUrl}
                  onChange={(e) => setNotifConfig({ ...notifConfig, customUrl: e.target.value })}
                  placeholder="https://raw.githubusercontent.com/.../notifications.json"
                />
                <span className="text-[10px] text-muted">
                  💡 Untuk mengirimkan notifikasi baru ke pengguna, tambahkan entri ke berkas <code>notifications.json</code> di repositori GitHub Anda.
                </span>
              </div>
            )}

            <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none pt-1">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 rounded text-cyan-500 focus:ring-0 bg-slate-800 border-slate-700 cursor-pointer"
                checked={notifConfig.enableBruno}
                onChange={(e) => setNotifConfig({ ...notifConfig, enableBruno: e.target.checked })}
              />
              <span className="text-slate-200 font-medium">Pertahankan Notifikasi Komunitas Bruno (appinfo.usebruno.com)</span>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              className="btn btn-sm btn-secondary flex items-center gap-1.5 text-xs"
              onClick={handleSaveNotifConfig}
              disabled={savingNotif}
            >
              <IconDeviceFloppy size={13} />
              <span>{savingNotif ? 'Menyimpan...' : 'Simpan Pengaturan Feed'}</span>
            </button>

            <button
              type="button"
              className="btn btn-sm btn-secondary flex items-center gap-1.5 text-xs"
              onClick={handleRefreshNotif}
              disabled={refreshingNotif}
            >
              <IconRefresh size={13} className={refreshingNotif ? 'animate-spin' : ''} />
              <span>{refreshingNotif ? 'Memuat...' : 'Segarkan Notifikasi Sekarang'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. About & Upstream Attribution */}
      <section className="support-group mb-4" aria-labelledby="support-about-label">
        <h3 className="support-group-label select-none" id="support-about-label">
          Tentang NgaRingApi & Atribusi Proyek Upstream
        </h3>
        <div className="support-card p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex-shrink-0">
              <IconGitFork size={20} />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-semibold text-slate-100">
                Modifikasi Resmi Berbasis Repositori Open-Source Bruno
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                <strong>NgaRingApi</strong> adalah IDE dan klien pengujian API desktop lokal-pertama yang dibangun dan dimodifikasi secara ekstensif dari repositori open-source upstream{' '}
                <a
                  href="https://github.com/usebruno/bruno"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline font-medium"
                >
                  Bruno (https://github.com/usebruno/bruno)
                </a>
                , yang diciptakan oleh Anoop M D dan para kontributor komunitas global.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-2 text-xs text-slate-300">
            <div className="font-medium text-slate-200">Keunggulan & Peningkatan pada NgaRingApi:</div>
            <ul className="list-disc list-inside space-y-1 text-muted text-[11.5px] pl-1">
              <li><strong className="text-slate-300">Smart Auto-Updater</strong>: Pembaruan versi terpadu satu titik di pojok kanan bawah dengan metrik waktu nyata dan instalasi mulus.</li>
              <li><strong className="text-slate-300">Multi-Channel Feed Engine</strong>: Pengumuman mandiri nyawit.dev yang berjalan berdampingan dengan feed komunitas Bruno.</li>
              <li><strong className="text-slate-300">Local-First Privacy</strong>: Koleksi permintaan API tersimpan sebagai berkas teks biasa di sistem lokal tanpa kewajiban cloud sinkronisasi.</li>
              <li><strong className="text-slate-300">Custom Dark Interface</strong>: Estetika Obsidian Catppuccin yang dirancang untuk produktivitas pengembang modern.</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              href="https://github.com/nyawit-dev/ngaRing-Api"
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-secondary flex items-center gap-1.5 text-xs text-cyan-400"
            >
              <IconBrandGithub size={13} />
              <span>Repositori NgaRingApi</span>
            </a>

            <a
              href="https://github.com/usebruno/bruno"
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-secondary flex items-center gap-1.5 text-xs"
            >
              <IconGitFork size={13} />
              <span>Upstream Bruno Repo</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4. Help & Community Links */}
      {SUPPORT_GROUPS.map((group) => (
        <section className="support-group" key={group.key} aria-labelledby={`support-${group.key}-label`}>
          <h3 className="support-group-label select-none" id={`support-${group.key}-label`}>
            {t(group.label)}
          </h3>
          <div className="support-card">
            {group.links.map(({ key, icon: Icon, url, label, description }) => (
              <a
                key={key}
                className="support-link"
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-labelledby={`support-link-${key}-label`}
                aria-describedby={`support-link-${key}-description`}
                data-testid={`support-${key}`}
              >
                <span className="support-link-tile">
                  <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="support-link-text">
                  <span className="support-link-label" id={`support-link-${key}-label`}>
                    {t(label)}
                  </span>
                  <span className="support-link-description" id={`support-link-${key}-description`}>
                    {t(description)}
                  </span>
                </span>
                <IconExternalLink className="support-link-affordance" size={16} strokeWidth={1.5} aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>
      ))}
    </StyledWrapper>
  );
};

export default Support;
