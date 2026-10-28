import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: clamp(560px, 86vh, 920px);
  max-height: calc(100vh - 60px);
  min-height: 480px;
  overflow: hidden;
  color: ${(props) => props.theme.text};
  background-color: ${(props) => props.theme.background.base};
  box-sizing: border-box;

  /* Global focus states */
  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid ${(props) => props.theme.primary.solid};
    outline-offset: 1px;
  }

  /* Skeleton shimmer */
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      ${(props) => props.theme.background.surface0} 25%,
      ${(props) => props.theme.background.surface1} 50%,
      ${(props) => props.theme.background.surface0} 75%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    border-radius: 4px;
  }

  /* -------------------------------------------------------------
     Top Header Bar
  -------------------------------------------------------------- */
  .git-header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.125rem;
    border-bottom: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.mantle};
    gap: 1rem;
    min-width: 0;

    .git-header-left {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      min-width: 0;
      flex-shrink: 1;
    }

    .git-header-center {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .git-header-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
      justify-content: flex-end;
    }
  }

  .git-branding-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.65rem;
    background-color: ${(props) => props.theme.background.surface1};
    border: 1px solid ${(props) => props.theme.border.border0};
    border-radius: 8px;
    user-select: none;
    flex-shrink: 0;

    .cat-brand-avatar {
      font-size: 1.125rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
    }

    .cat-brand-info {
      display: flex;
      flex-direction: column;
      line-height: 1.15;

      .cat-brand-title {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: ${(props) => props.theme.text};
      }

      .cat-brand-sub {
        font-size: 0.625rem;
        font-weight: 600;
        color: #eab308;
      }
    }
  }

  .git-repo-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.65rem;
    background-color: ${(props) => props.theme.background.surface0};
    border: 1px solid ${(props) => props.theme.border.border0};
    border-radius: 6px;
    font-size: 0.8125rem;
    color: ${(props) => props.theme.text};
    white-space: nowrap;
    max-width: 170px;

    .repo-icon {
      color: ${(props) => props.theme.primary.solid};
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .repo-title {
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .syncing-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.6875rem;
    font-weight: 600;
    color: #3b82f6;
    background-color: rgba(59, 130, 246, 0.12);
    border: 1px solid rgba(59, 130, 246, 0.25);
    flex-shrink: 0;

    .sync-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #3b82f6;
      animation: ${spin} 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  }

  /* Branch selector dropdown pill */
  .git-branch-control {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    background-color: ${(props) => props.theme.background.surface0};
    border: 1px solid ${(props) => props.theme.border.border0};
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    transition: all 0.15s ease;

    &:hover {
      border-color: ${(props) => props.theme.border.border1};
      background-color: ${(props) => props.theme.background.surface1};
    }

    .branch-icon {
      color: #eab308;
      flex-shrink: 0;
    }

    .git-branch-select {
      background: transparent;
      border: none;
      color: ${(props) => props.theme.text};
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      padding-right: 0.25rem;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:focus {
        outline: none;
      }

      option {
        background-color: ${(props) => props.theme.background.mantle};
        color: ${(props) => props.theme.text};
      }
    }

    .new-branch-btn {
      color: ${(props) => props.theme.primary.solid};
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0.15rem 0.35rem;
      border-radius: 3px;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background-color 0.15s;

      &:hover {
        background-color: rgba(234, 179, 8, 0.12);
      }
    }
  }

  /* Ahead / Behind status indicators */
  .git-ahead-behind-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 5px;
    background-color: ${(props) => props.theme.background.surface0};
    border: 1px solid ${(props) => props.theme.border.border0};
    flex-shrink: 0;

    .ahead-item {
      display: inline-flex;
      align-items: center;
      color: #22c55e;
      gap: 2px;
    }

    .behind-item {
      display: inline-flex;
      align-items: center;
      color: #ef4444;
      gap: 2px;
    }
  }

  /* Segmented Nav Tabs */
  .git-nav-tabs {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background-color: ${(props) => props.theme.background.surface0};
    padding: 0.25rem;
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.border.border0};

    .git-tab-item {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 6px;
      color: ${(props) => props.theme.text.subtext1};
      background: transparent;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;

      &:hover:not(.active) {
        color: ${(props) => props.theme.text};
        background-color: ${(props) => props.theme.background.surface1};
      }

      &.active {
        color: ${(props) => props.theme.text};
        background-color: ${(props) => props.theme.background.base};
        font-weight: 600;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      }

      .tab-badge {
        font-size: 0.6875rem;
        font-weight: 700;
        padding: 0.1rem 0.4rem;
        border-radius: 9999px;
        background-color: rgba(234, 179, 8, 0.18);
        color: #eab308;
      }
    }
  }

  /* Action Buttons in Header */
  .git-action-group {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;

    .git-sync-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid ${(props) => props.theme.border.border1};
      background-color: ${(props) => props.theme.background.surface0};
      color: ${(props) => props.theme.text};
      transition: all 0.15s ease;

      &:hover:not(:disabled) {
        background-color: ${(props) => props.theme.background.surface1};
        border-color: ${(props) => props.theme.border.border0};
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.accent-highlight {
        background-color: ${(props) => props.theme.primary.solid};
        color: #fff;
        border-color: ${(props) => props.theme.primary.solid};
        font-weight: 600;

        &:hover:not(:disabled) {
          filter: brightness(1.1);
        }
      }
    }

    .icon-btn-refresh {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid ${(props) => props.theme.border.border0};
      color: ${(props) => props.theme.text.subtext1};
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        color: ${(props) => props.theme.text};
        background-color: ${(props) => props.theme.background.surface0};
      }

      &.is-spinning {
        animation: ${spin} 1s linear infinite;
        color: ${(props) => props.theme.primary.solid};
      }
    }

    .icon-btn-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: transparent;
      border: none;
      color: ${(props) => props.theme.text.subtext1};
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        color: ${(props) => props.theme.text};
        background-color: ${(props) => props.theme.background.surface1};
      }
    }
  }

  /* -------------------------------------------------------------
     Notification & Conflict Banners
  -------------------------------------------------------------- */
  .git-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1.125rem;
    font-size: 0.75rem;
    border-bottom: 1px solid transparent;

    &.conflict {
      background-color: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border-bottom-color: rgba(239, 68, 68, 0.25);
    }

    &.warning {
      background-color: rgba(234, 179, 8, 0.1);
      color: #eab308;
      border-bottom-color: rgba(234, 179, 8, 0.2);
    }

    &.error {
      background-color: rgba(239, 68, 68, 0.08);
      color: #f87171;
      border-bottom-color: rgba(239, 68, 68, 0.2);
    }
  }

  /* -------------------------------------------------------------
     Main Container & Changes Split Layout
  -------------------------------------------------------------- */
  .git-main-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
    background-color: ${(props) => props.theme.background.base};

    @media (max-width: 820px) {
      flex-direction: column;
    }
  }

  /* Left Panel: Files & Commit Composer */
  .git-files-panel {
    width: 360px;
    min-width: 280px;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.mantle};
    flex-shrink: 0;
    overflow: hidden;

    @media (max-width: 820px) {
      width: 100%;
      max-width: 100%;
      border-right: none;
      border-bottom: 1px solid ${(props) => props.theme.border.border0};
      max-height: 45vh;
    }
  }

  .git-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.875rem;
    border-bottom: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.surface0};

    .panel-title {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: ${(props) => props.theme.text.subtext1};
    }

    .panel-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  .git-file-search {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.35rem 0.75rem;
    border-bottom: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.mantle};

    .search-icon {
      color: ${(props) => props.theme.text.subtext1};
      flex-shrink: 0;
    }

    input {
      flex: 1;
      background: transparent;
      border: none;
      font-size: 0.75rem;
      color: ${(props) => props.theme.text};
      outline: none;

      &::placeholder {
        color: ${(props) => props.theme.text.subtext1};
      }
    }

    .clear-search-btn {
      background: transparent;
      border: none;
      color: ${(props) => props.theme.text.subtext1};
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 2px;
      border-radius: 3px;

      &:hover {
        color: ${(props) => props.theme.text};
        background-color: ${(props) => props.theme.background.surface1};
      }
    }
  }

  .git-small-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0.45rem;
    font-size: 0.6875rem;
    font-weight: 500;
    color: ${(props) => props.theme.text.subtext1};
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      color: ${(props) => props.theme.text};
      background-color: ${(props) => props.theme.background.surface1};
    }

    &.accent {
      color: ${(props) => props.theme.primary.solid};
      &:hover {
        background-color: rgba(234, 179, 8, 0.12);
      }
    }

    &.danger {
      color: #ef4444;
      &:hover {
        background-color: rgba(239, 68, 68, 0.12);
      }
    }
  }

  /* File Lists container */
  .git-scroll-files {
    flex: 1;
    overflow-y: auto;
    padding: 0.25rem 0;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: ${(props) => props.theme.border.border1};
      border-radius: 3px;
    }
  }

  .git-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.45rem 0.875rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: ${(props) => props.theme.text.subtext1};
    background-color: ${(props) => props.theme.background.mantle};
    border-bottom: 1px solid ${(props) => props.theme.border.border0};
    border-top: 1px solid ${(props) => props.theme.border.border0};

    &:first-child {
      border-top: none;
    }

    &.group-conflict {
      color: #ef4444;
      background-color: rgba(239, 68, 68, 0.06);
    }
    &.group-staged {
      color: #22c55e;
      background-color: rgba(34, 197, 94, 0.06);
    }
  }

  .git-file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.375rem 0.875rem;
    font-size: 0.75rem;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: ${(props) => props.theme.background.surface0};

      .file-hover-actions {
        opacity: 1;
      }
    }

    &.selected {
      background-color: ${(props) => props.theme.background.surface1};
      border-left-color: ${(props) => props.theme.primary.solid};
    }

    .file-item-main {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
      flex: 1;
    }

    .file-path-text {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      .dir-prefix {
        color: ${(props) => props.theme.text.subtext1};
        font-size: 0.6875rem;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-name {
        font-weight: 500;
        color: ${(props) => props.theme.text};
      }
    }

    .file-hover-actions {
      opacity: 0;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transition: opacity 0.15s ease;

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 4px;
        background: transparent;
        border: none;
        color: ${(props) => props.theme.text.subtext1};
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          color: ${(props) => props.theme.text};
          background-color: ${(props) => props.theme.background.surface2};
        }

        &.stage-btn:hover {
          color: #22c55e;
          background-color: rgba(34, 197, 94, 0.15);
        }

        &.unstage-btn:hover {
          color: #eab308;
          background-color: rgba(234, 179, 8, 0.15);
        }

        &.discard-btn:hover {
          color: #ef4444;
          background-color: rgba(239, 68, 68, 0.15);
        }
      }
    }
  }

  /* File Status Badges (A, M, D, R, U) */
  .git-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 17px;
    height: 17px;
    font-size: 0.625rem;
    font-weight: 700;
    border-radius: 3px;
    flex-shrink: 0;

    &.status-m {
      background-color: rgba(234, 179, 8, 0.15);
      color: #eab308;
    }
    &.status-a {
      background-color: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }
    &.status-d {
      background-color: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }
    &.status-r {
      background-color: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }
    &.status-u {
      background-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
  }

  /* Bottom Commit Composer */
  .git-commit-composer {
    display: flex;
    flex-direction: column;
    padding: 0.75rem 0.875rem;
    border-top: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.mantle};
    gap: 0.45rem;

    .conventional-chips {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      overflow-x: auto;
      padding-bottom: 2px;

      &::-webkit-scrollbar {
        display: none;
      }

      button {
        padding: 0.125rem 0.45rem;
        font-size: 0.6875rem;
        font-weight: 500;
        border-radius: 4px;
        border: 1px solid ${(props) => props.theme.border.border0};
        background-color: ${(props) => props.theme.background.surface0};
        color: ${(props) => props.theme.text.subtext1};
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s ease;

        &:hover {
          background-color: ${(props) => props.theme.background.surface1};
          color: ${(props) => props.theme.text};
          border-color: ${(props) => props.theme.border.border1};
        }
      }
    }

    .commit-textarea {
      width: 100%;
      background-color: ${(props) => props.theme.background.surface0};
      border: 1px solid ${(props) => props.theme.border.border1};
      color: ${(props) => props.theme.text};
      border-radius: 6px;
      padding: 0.5rem 0.65rem;
      font-size: 0.8125rem;
      line-height: 1.4;
      resize: none;
      box-sizing: border-box;
      transition: border-color 0.15s ease;

      &:focus {
        border-color: ${(props) => props.theme.primary.solid};
      }

      &::placeholder {
        color: ${(props) => props.theme.text.subtext1};
      }
    }

    .commit-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;

      .shortcut-hint {
        font-size: 0.6875rem;
        color: ${(props) => props.theme.text.subtext1};

        &.warn {
          color: #eab308;
          font-weight: 500;
        }

        &.danger {
          color: #ef4444;
          font-weight: 600;
        }
      }

      .commit-submit-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.375rem 0.875rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 6px;
        background-color: ${(props) => props.theme.primary.solid};
        color: #fff;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover:not(:disabled) {
          filter: brightness(1.1);
        }

        &:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
      }
    }
  }

  /* -------------------------------------------------------------
     Right Diff Pane
  -------------------------------------------------------------- */
  .git-diff-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    background-color: ${(props) => props.theme.background.base};
  }

  .git-diff-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.mantle};
    gap: 0.75rem;

    .diff-file-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 0.8125rem;
      font-weight: 600;
      color: ${(props) => props.theme.text};
    }

    .diff-stats-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.6875rem;
      font-weight: 600;
      font-family: ui-monospace, SFMono-Regular, monospace;

      .stat-add {
        color: #22c55e;
        background-color: rgba(34, 197, 94, 0.12);
        padding: 0.1rem 0.35rem;
        border-radius: 3px;
      }

      .stat-del {
        color: #ef4444;
        background-color: rgba(239, 68, 68, 0.12);
        padding: 0.1rem 0.35rem;
        border-radius: 3px;
      }
    }

    .diff-actions {
      display: flex;
      align-items: center;
      gap: 0.375rem;

      .copy-diff-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.6875rem;
        font-weight: 500;
        color: ${(props) => props.theme.text.subtext1};
        background-color: ${(props) => props.theme.background.surface0};
        border: 1px solid ${(props) => props.theme.border.border0};
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          color: ${(props) => props.theme.text};
          background-color: ${(props) => props.theme.background.surface1};
        }

        &.copied {
          color: #22c55e;
          border-color: rgba(34, 197, 94, 0.4);
        }
      }
    }

    .diff-mode-switcher {
      display: inline-flex;
      align-items: center;
      background-color: ${(props) => props.theme.background.surface0};
      border: 1px solid ${(props) => props.theme.border.border0};
      border-radius: 6px;
      padding: 2px;
      gap: 2px;

      button {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.55rem;
        font-size: 0.6875rem;
        font-weight: 500;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: ${(props) => props.theme.text.subtext1};
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover:not(.active) {
          color: ${(props) => props.theme.text};
        }

        &.active {
          background-color: ${(props) => props.theme.background.base};
          color: ${(props) => props.theme.text};
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .git-diff-content-area {
    flex: 1;
    overflow-y: auto;
    position: relative;
    background-color: ${(props) => props.theme.background.base};
  }

  /* Empty Diff State with NgaRing Mascot & Shortcuts */
  .git-diff-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 380px;
    padding: 2.5rem;
    color: ${(props) => props.theme.text.subtext1};
    text-align: center;
    gap: 1.25rem;

    .cat-mascot-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.25rem 1.75rem;
      border-radius: 12px;
      background-color: ${(props) => props.theme.background.surface0};
      border: 1px solid ${(props) => props.theme.border.border0};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

      .cat-ascii {
        font-family: ui-monospace, monospace;
        font-size: 1.125rem;
        line-height: 1.25;
        color: #eab308;
        margin-bottom: 0.5rem;
        user-select: none;
      }

      .cat-title {
        font-size: 0.9375rem;
        font-weight: 700;
        color: ${(props) => props.theme.text};
      }

      .cat-subtitle {
        font-size: 0.75rem;
        color: ${(props) => props.theme.text.subtext1};
        margin-top: 0.25rem;
      }
    }

    .shortcuts-card {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
      width: 100%;
      max-width: 440px;

      .shortcut-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.4rem 0.65rem;
        background-color: ${(props) => props.theme.background.mantle};
        border: 1px solid ${(props) => props.theme.border.border0};
        border-radius: 6px;
        font-size: 0.6875rem;

        .key-badge {
          font-family: ui-monospace, monospace;
          background-color: ${(props) => props.theme.background.surface1};
          border: 1px solid ${(props) => props.theme.border.border1};
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          font-weight: 600;
          color: ${(props) => props.theme.text};
        }
      }
    }
  }

  /* Monospace unified raw diff view */
  .raw-diff-container {
    padding: 0.5rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.75rem;
    line-height: 1.5;

    .diff-line {
      display: flex;
      padding: 0.1rem 0.5rem;
      white-space: pre-wrap;
      word-break: break-all;
      border-radius: 2px;

      &.diff-addition {
        background-color: rgba(34, 197, 94, 0.12);
        color: #22c55e;
      }
      &.diff-deletion {
        background-color: rgba(239, 68, 68, 0.12);
        color: #ef4444;
      }
      &.diff-header {
        background-color: rgba(59, 130, 246, 0.1);
        color: #60a5fa;
        font-weight: 600;
      }
    }
  }

  /* -------------------------------------------------------------
     History Tab
  -------------------------------------------------------------- */
  .git-history-layout {
    display: flex;
    flex: 1;
    overflow: hidden;

    @media (max-width: 820px) {
      flex-direction: column;
    }

    .history-list-pane {
      width: 380px;
      min-width: 300px;
      border-right: 1px solid ${(props) => props.theme.border.border0};
      background-color: ${(props) => props.theme.background.mantle};
      display: flex;
      flex-direction: column;
      overflow: hidden;

      @media (max-width: 820px) {
        width: 100%;
        max-height: 45vh;
        border-right: none;
        border-bottom: 1px solid ${(props) => props.theme.border.border0};
      }
    }

    .history-detail-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background-color: ${(props) => props.theme.background.base};
    }
  }

  .history-commit-row {
    padding: 0.625rem 0.875rem;
    border-bottom: 1px solid ${(props) => props.theme.border.border0};
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: ${(props) => props.theme.background.surface0};
    }

    &.selected {
      background-color: ${(props) => props.theme.background.surface1};
      border-left: 2px solid ${(props) => props.theme.primary.solid};
    }

    .commit-message-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: ${(props) => props.theme.text};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 0.25rem;
    }

    .commit-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.6875rem;
      color: ${(props) => props.theme.text.subtext1};

      .commit-hash-pill {
        font-family: ui-monospace, SFMono-Regular, monospace;
        padding: 0.1rem 0.35rem;
        background-color: ${(props) => props.theme.background.surface2};
        border-radius: 4px;
        color: ${(props) => props.theme.text};
      }
    }
  }

  /* -------------------------------------------------------------
     Stash & Remote / GitHub Tab Cards
  -------------------------------------------------------------- */
  .git-tab-card-container {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 860px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .git-card {
    background-color: ${(props) => props.theme.background.mantle};
    border: 1px solid ${(props) => props.theme.border.border0};
    border-radius: 8px;
    padding: 1.125rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;

    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: ${(props) => props.theme.text};
    }

    .card-description {
      font-size: 0.75rem;
      color: ${(props) => props.theme.text.subtext1};
      line-height: 1.45;
    }
  }

  .git-styled-input {
    background-color: ${(props) => props.theme.background.surface0};
    border: 1px solid ${(props) => props.theme.border.border1};
    color: ${(props) => props.theme.text};
    border-radius: 6px;
    padding: 0.45rem 0.75rem;
    font-size: 0.8125rem;
    box-sizing: border-box;
    width: 100%;
    transition: border-color 0.15s ease;

    &:focus {
      border-color: ${(props) => props.theme.primary.solid};
    }

    &::placeholder {
      color: ${(props) => props.theme.text.subtext1};
    }
  }

  /* Skeleton Loading layout matching the modal structure */
  .git-skeleton-shell {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;

    .sk-header {
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid ${(props) => props.theme.border.border0};
      background-color: ${(props) => props.theme.background.mantle};
      gap: 1rem;
    }

    .sk-body {
      display: flex;
      flex: 1;

      .sk-left {
        width: 360px;
        border-right: 1px solid ${(props) => props.theme.border.border0};
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .sk-right {
        flex: 1;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
    }
  }
`;

export default StyledWrapper;
