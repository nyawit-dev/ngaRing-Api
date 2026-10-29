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

  return (
    <StyledWrapper className="w-full">
      <div className="section-header">Support</div>

      <section className="support-group mb-4" aria-labelledby="support-updates-label">
        <h3 className="support-group-label select-none" id="support-updates-label">
          Software Updates
        </h3>
        <div className="support-card p-3 flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">NgaRingApi Desktop v{version}</span>
            <span className="text-xs text-muted">Automatic background updates enabled</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-secondary flex items-center gap-1.5"
            onClick={handleCheckUpdate}
            disabled={checking}
          >
            <IconRefresh size={14} className={checking ? 'animate-spin' : ''} />
            <span>{checking ? 'Checking...' : 'Check for Updates'}</span>
          </button>
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
