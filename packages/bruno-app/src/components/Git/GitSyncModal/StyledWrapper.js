import styled, { keyframes } from 'styled-components';

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
  height: clamp(520px, 82vh, 880px);
  max-height: calc(100vh - 80px);
  min-height: 440px;
  overflow: hidden;
  color: ${(props) => props.theme.text};
  box-sizing: border-box;

  /* Shimmer / Skeleton Loaders */
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      ${(props) => props.theme.background.surface0} 25%,
      ${(props) => props.theme.background.surface1} 50%,
      ${(props) => props.theme.background.surface0} 75%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    border-radius: 4px;
  }

  .git-skeleton-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .skeleton-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 1rem;
      border-bottom: 1px solid ${(props) => props.theme.border.border0};
      background-color: ${(props) => props.theme.background.mantle};
      gap: 1rem;
    }

    .skeleton-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .skeleton-sidebar {
      width: 340px;
      padding: 0.75rem;
      border-right: 1px solid ${(props) => props.theme.border.border0};
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background-color: ${(props) => props.theme.background.base};
    }

    .skeleton-diff {
      flex: 1;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background-color: ${(props) => props.theme.background.crust};
    }
  }

  /* Navigation Header */
  .git-header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 1rem;
    border-bottom: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.mantle};
    gap: 0.75rem;
    flex-wrap: wrap;

    @media (max-width: 960px) {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;

      .git-header-left,
      .git-header-right {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    }
  }

  .git-branch-select {
    max-width: min(180px, 40vw);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .git-ahead-behind-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    background-color: ${(props) => props.theme.background.surface0};
    border: 1px solid ${(props) => props.theme.border.border0};
    flex-shrink: 0;
  }

  .git-user-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    background-color: ${(props) => props.theme.background.surface0};
    border: 1px solid ${(props) => props.theme.border.border0};
    cursor: pointer;
    transition: all 0.15s ease;
    max-width: 160px;

    &:hover {
      border-color: ${(props) => props.theme.border.border1};
      background-color: ${(props) => props.theme.background.surface1};
    }
  }

  .git-tabs {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background-color: ${(props) => props.theme.background.surface0};
    padding: 0.25rem;
    border-radius: 6px;
    border: 1px solid ${(props) => props.theme.border.border0};
    overflow-x: auto;
    max-width: 100%;

    .git-tab-btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.35rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 4px;
      color: ${(props) => props.theme.text.subtext1};
      background: transparent;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
      min-height: 32px;

      &:hover {
        color: ${(props) => props.theme.text};
        background-color: ${(props) => props.theme.background.surface1};
      }

      &.active {
        color: ${(props) => props.theme.text};
        background-color: ${(props) => props.theme.background.base};
        font-weight: 600;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
    }
  }

  /* Body Layout */
  .git-body-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .git-sidebar {
    width: 340px;
    min-width: 260px;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.base};
    overflow: hidden;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 100%;
      min-width: 100%;
      max-width: 100%;
      border-right: none;
    }
  }

  .git-diff-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    background-color: ${(props) => props.theme.background.crust};

    @media (max-width: 768px) {
      width: 100%;
      min-width: 100%;
    }
  }

  .git-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.875rem;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${(props) => props.theme.text.subtext1};
    background-color: ${(props) => props.theme.background.mantle};
    border-bottom: 1px solid ${(props) => props.theme.border.border0};
  }

  .git-file-list {
    overflow-y: auto;
    flex: 1;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: ${(props) => props.theme.border.border1};
      border-radius: 3px;
    }
  }

  .git-file-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: ${(props) => props.theme.background.surface0};

      .git-row-actions {
        opacity: 1;
      }
    }

    &.selected {
      background-color: ${(props) => props.theme.background.surface1};
      border-left-color: ${(props) => props.theme.primary.solid};
    }

    .git-row-actions {
      opacity: 0.7;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transition: opacity 0.15s ease;
    }
  }

  .git-status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 0.6875rem;
    font-weight: 700;
    border-radius: 4px;
    margin-right: 0.5rem;
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
    &.status-u {
      background-color: rgba(168, 85, 247, 0.15);
      color: #a855f7;
    }
  }

  .git-commit-box {
    padding: 0.875rem;
    border-top: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.mantle};
  }

  /* Form Elements (Themed, Light/Dark Adaptive) */
  .git-input {
    background-color: ${(props) => props.theme.background.surface0};
    border: 1px solid ${(props) => props.theme.border.border1};
    color: ${(props) => props.theme.text};
    border-radius: 4px;
    padding: 0.35rem 0.625rem;
    font-size: 0.75rem;
    transition: border-color 0.15s ease;

    &:focus {
      outline: none;
      border-color: ${(props) => props.theme.primary.solid};
    }

    &::placeholder {
      color: ${(props) => props.theme.text.subtext1};
    }
  }

  .git-textarea {
    background-color: ${(props) => props.theme.background.surface0};
    border: 1px solid ${(props) => props.theme.border.border1};
    color: ${(props) => props.theme.text};
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    line-height: 1.45;
    resize: none;
    transition: border-color 0.15s ease;

    &:focus {
      outline: none;
      border-color: ${(props) => props.theme.primary.solid};
    }

    &::placeholder {
      color: ${(props) => props.theme.text.subtext1};
    }
  }

  .git-diff-header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 1rem;
    border-bottom: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.mantle};
    font-size: 0.75rem;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .git-empty-diff {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1.5rem;
    color: ${(props) => props.theme.text.subtext1};
    text-align: center;
    gap: 0.625rem;

    .empty-icon {
      color: ${(props) => props.theme.text.subtext0};
      opacity: 0.5;
    }

    .empty-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: ${(props) => props.theme.text};
    }

    .empty-hint {
      font-size: 0.75rem;
      max-width: 320px;
      line-height: 1.4;
      color: ${(props) => props.theme.text.subtext1};
    }
  }

  .git-toggle-pill-group {
    display: inline-flex;
    align-items: center;
    background-color: ${(props) => props.theme.background.surface0};
    border: 1px solid ${(props) => props.theme.border.border0};
    border-radius: 4px;
    padding: 2px;
    gap: 2px;

    .git-toggle-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.5rem;
      font-size: 0.6875rem;
      font-weight: 500;
      border-radius: 3px;
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
        color: ${(props) => props.theme.primary.solid};
        font-weight: 600;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .git-secret-guard-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    color: #34d399;
    background-color: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.25);
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-weight: 500;
  }

  .git-conventional-btn {
    padding: 0.15rem 0.35rem;
    font-size: 0.6875rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    color: ${(props) => props.theme.text.subtext1};
    background-color: ${(props) => props.theme.background.surface0};
    border: 1px solid ${(props) => props.theme.border.border0};
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.12s ease;

    &:hover {
      color: ${(props) => props.theme.text};
      border-color: ${(props) => props.theme.primary.solid};
      background-color: ${(props) => props.theme.background.surface1};
    }
  }

  /* Diff Viewer */
  .diff-view-content {
    flex: 1;
    overflow: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.8125rem;
    line-height: 1.5;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: ${(props) => props.theme.border.border1};
      border-radius: 3px;
    }
  }

  .diff-line {
    display: flex;
    white-space: pre-wrap;
    word-break: break-all;
    padding: 0 0.75rem;

    &.diff-addition {
      background-color: rgba(34, 197, 94, 0.12);
      color: #4ade80;
    }

    &.diff-deletion {
      background-color: rgba(239, 68, 68, 0.12);
      color: #f87171;
    }

    &.diff-header {
      background-color: rgba(59, 130, 246, 0.12);
      color: #60a5fa;
      font-weight: 600;
    }
  }

  .visual-diff-wrapper {
    flex: 1;
    overflow: auto;
  }

  /* Commit History Timeline */
  .git-history-container {
    flex: 1;
    overflow-y: auto;
    padding: clamp(0.75rem, 2vw, 1.25rem);

    .commit-card {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 0.875rem 1rem;
      border-radius: 6px;
      background-color: ${(props) => props.theme.background.mantle};
      border: 1px solid ${(props) => props.theme.border.border0};
      margin-bottom: 0.75rem;
      transition: all 0.15s ease;

      &:hover {
        border-color: ${(props) => props.theme.border.border1};
      }

      &.expanded {
        border-color: ${(props) => props.theme.primary.solid};
        background-color: ${(props) => props.theme.background.surface0};
      }
    }

    .commit-files-box {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid ${(props) => props.theme.border.border0};
    }

    .git-author-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: ${(props) => props.theme.primary.solid};
      color: #1e1e1e;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6875rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .git-hash-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.6875rem;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      background-color: ${(props) => props.theme.background.surface0};
      border: 1px solid ${(props) => props.theme.border.border0};
      color: ${(props) => props.theme.text.subtext1};
      cursor: pointer;
      transition: all 0.12s ease;

      &:hover {
        color: ${(props) => props.theme.primary.solid};
        border-color: ${(props) => props.theme.primary.solid};
        background-color: ${(props) => props.theme.background.surface1};
      }
    }
  }

  .git-card-nested {
    background-color: ${(props) => props.theme.background.surface0};
    border: 1px solid ${(props) => props.theme.border.border0};
    border-radius: 6px;
    padding: 0.75rem;
  }

  /* Stash View */
  .git-stash-container {
    flex: 1;
    overflow-y: auto;
    padding: clamp(0.75rem, 2vw, 1.25rem);

    .stash-create-box {
      padding: 1rem;
      border-radius: 6px;
      background-color: ${(props) => props.theme.background.mantle};
      border: 1px solid ${(props) => props.theme.border.border0};
      margin-bottom: 1rem;
    }

    .stash-card {
      padding: 0.875rem 1rem;
      border-radius: 6px;
      background-color: ${(props) => props.theme.background.mantle};
      border: 1px solid ${(props) => props.theme.border.border0};
      margin-bottom: 0.75rem;
      transition: all 0.15s ease;

      &:hover {
        border-color: ${(props) => props.theme.border.border1};
      }
    }
  }

  /* GitHub Account Tab */
  .github-tab-container {
    flex: 1;
    overflow-y: auto;
    padding: clamp(1rem, 3vw, 2rem) 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    max-width: 680px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: ${(props) => props.theme.border.border1};
      border-radius: 3px;
    }
  }

  .github-card {
    width: 100%;
    padding: clamp(1rem, 2.5vw, 1.75rem);
    background-color: ${(props) => props.theme.background.mantle};
    border: 1px solid ${(props) => props.theme.border.border0};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
  }
`;

export default StyledWrapper;
