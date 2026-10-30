import React, { useState } from 'react';
import {
  IconSpeakerphone,
  IconBrandTwitter,
  IconBrandGithub,
  IconBrandDiscord,
  IconBrandLinkedin,
  IconBook,
  IconExternalLink,
  IconRefresh
} from '@tabler/icons';
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

const Support = () => {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
  const [updaterInfo, setUpdaterInfo] = useState({
    status: 'idle',
    lastCheckedAt: null,
    availableVersion: null
  });

  React.useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('updater:get-status')
        .then((state) => {
          if (state) setUpdaterInfo(state);
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
      <div className="section-header">Support & Updates</div>

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
                {formatLastChecked(updaterInfo.lastCheckedAt)} • Kanal Rilis Resmi GitHub
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
