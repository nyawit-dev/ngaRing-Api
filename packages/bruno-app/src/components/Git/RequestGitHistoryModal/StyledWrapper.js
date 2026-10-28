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
  height: clamp(480px, 78vh, 800px);
  max-height: calc(100vh - 100px);
  overflow: hidden;
  color: ${(props) => props.theme.text};
  box-sizing: border-box;

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

  .history-modal-body {
    display: flex;
    flex: 1;
    overflow: hidden;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .commits-sidebar {
    width: 320px;
    min-width: 250px;
    max-width: 380px;
    border-right: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.base};
    overflow-y: auto;
    flex-shrink: 0;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: ${(props) => props.theme.border.border1};
      border-radius: 3px;
    }

    @media (max-width: 768px) {
      width: 100%;
      min-width: 100%;
      max-width: 100%;
      max-height: 220px;
      border-right: none;
      border-bottom: 1px solid ${(props) => props.theme.border.border0};
    }
  }

  .history-sidebar-header {
    padding: 0.625rem 0.875rem;
    border-bottom: 1px solid ${(props) => props.theme.border.border0};
    background-color: ${(props) => props.theme.background.mantle};
    font-size: 0.75rem;
    font-weight: 600;
    color: ${(props) => props.theme.text};
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    flex-shrink: 0;
  }

  .git-author-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${(props) => props.theme.primary.solid};
    color: #1e1e1e;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.625rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .commit-item {
    padding: 0.75rem 0.875rem;
    border-bottom: 1px solid ${(props) => props.theme.border.border0};
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: ${(props) => props.theme.background.surface0};
    }

    &.selected {
      background-color: ${(props) => props.theme.background.surface1};
      border-left: 3px solid ${(props) => props.theme.primary.solid};
    }
  }

  .diff-main-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: ${(props) => props.theme.background.crust};
    min-width: 0;
  }

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
`;

export default StyledWrapper;
