import styled from 'styled-components';

const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;

  .update-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 20px;
    padding: 0 6px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    transition: all 140ms ease;
    border: 1px solid transparent;
    line-height: 1;

    &.check-btn {
      background: transparent;
      border-color: transparent;
      color: inherit;
      opacity: 0.85;

      .version-refresh-icon {
        opacity: 0.6;
        transition: transform 0.25s ease, opacity 0.2s ease;
      }

      &:hover {
        background: ${(props) => props.theme.sidebar?.hoverBg || 'rgba(255, 255, 255, 0.08)'};
        color: #38bdf8;
        opacity: 1;

        .version-refresh-icon {
          opacity: 1;
          transform: rotate(180deg);
        }
      }
    }

    &.checking {
      background: rgba(234, 179, 8, 0.08);
      border-color: rgba(234, 179, 8, 0.28);
      color: #eab308;
      cursor: default;
    }

    &.available {
      background: rgba(234, 179, 8, 0.14);
      border-color: rgba(234, 179, 8, 0.4);
      color: #facc15;
      font-weight: 600;

      &:hover {
        background: rgba(234, 179, 8, 0.22);
        border-color: #facc15;
      }
    }

    &.downloading {
      background: rgba(14, 165, 233, 0.1);
      border-color: rgba(14, 165, 233, 0.35);
      color: #38bdf8;
      cursor: default;

      .chip-label {
        font-weight: 500;
      }

      .percent-text {
        font-size: 10px;
        font-weight: 700;
        color: #7dd3fc;
        font-variant-numeric: tabular-nums;
      }

      .speed-text {
        font-size: 10px;
        color: rgba(125, 211, 252, 0.7);
        font-variant-numeric: tabular-nums;
      }
    }

    &.ready {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      border-color: #38bdf8;
      font-weight: 600;
      box-shadow: 0 0 10px rgba(14, 165, 233, 0.35);
      animation: readyPulse 2.5s infinite;

      &:hover {
        background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
      }
    }
  }

  .pulse-dot-amber {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #eab308;
    box-shadow: 0 0 0 rgba(234, 179, 8, 0.4);
    animation: amberPulse 1.6s infinite ease-out;
  }

  .pulse-dot-cyan {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #38bdf8;
    box-shadow: 0 0 0 rgba(56, 189, 248, 0.4);
    animation: cyanPulse 1.6s infinite ease-out;
  }

  .update-progress-bar {
    width: 44px;
    height: 4px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 2px;
    overflow: hidden;
    margin-left: 4px;

    .fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8, #06b6d4);
      border-radius: 2px;
      transition: width 150ms ease-out;
    }
  }

  @keyframes amberPulse {
    0% {
      transform: scale(0.9);
      box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7);
    }
    70% {
      transform: scale(1.15);
      box-shadow: 0 0 0 5px rgba(234, 179, 8, 0);
    }
    100% {
      transform: scale(0.9);
      box-shadow: 0 0 0 0 rgba(234, 179, 8, 0);
    }
  }

  @keyframes cyanPulse {
    0% {
      transform: scale(0.9);
      box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7);
    }
    70% {
      transform: scale(1.15);
      box-shadow: 0 0 0 5px rgba(56, 189, 248, 0);
    }
    100% {
      transform: scale(0.9);
      box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
    }
  }

  @keyframes readyPulse {
    0%, 100% {
      box-shadow: 0 0 6px rgba(14, 165, 233, 0.3);
    }
    50% {
      box-shadow: 0 0 12px rgba(14, 165, 233, 0.6);
    }
  }
`;

export default StyledWrapper;
