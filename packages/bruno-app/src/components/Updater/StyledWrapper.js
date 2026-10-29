import styled from 'styled-components';

const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;

  .update-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 24px;
    padding: 0 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    transition: all 120ms ease;
    border: 1px solid transparent;
    line-height: 1;

    &.downloading {
      background: rgba(6, 182, 212, 0.1);
      border-color: rgba(6, 182, 212, 0.3);
      color: #00f0ff;

      .spinner {
        animation: spin 1s linear infinite;
      }
    }

    &.ready {
      background: #0284c7;
      color: #ffffff;
      border-color: #00f0ff;
      box-shadow: 0 0 8px rgba(0, 240, 255, 0.25);

      &:hover {
        background: #0369a1;
      }
    }
  }

  .update-progress-bar {
    width: 32px;
    height: 3px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
    overflow: hidden;
    margin-left: 2px;

    .fill {
      height: 100%;
      background: #00f0ff;
      transition: width 200ms ease;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export default StyledWrapper;
