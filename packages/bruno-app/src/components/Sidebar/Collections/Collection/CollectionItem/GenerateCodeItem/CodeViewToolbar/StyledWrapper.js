import styled from 'styled-components';

const StyledWrapper = styled.div`
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${(props) => props.theme.modal.bg};
    gap: 12px;
    flex-shrink: 0;
  }

  .left-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .quick-lang-group {
    display: flex;
    gap: 3px;
    background: ${(props) => props.theme.dropdown?.bg || 'rgba(0, 0, 0, 0.2)'};
    padding: 2px;
    border-radius: 4px;
    border: 1px solid ${(props) => props.theme.border?.border2 || 'rgba(255, 255, 255, 0.08)'};
  }

  .quick-lang-btn {
    height: 28px;
    padding: 0 10px;
    background: transparent;
    border: none;
    border-radius: 3px;
    color: ${(props) => props.theme.colors?.text?.muted || props.theme.text};
    font-size: ${(props) => props.theme.font.size.xs || '0.75rem'};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;

    &:hover {
      color: ${(props) => props.theme.text};
      background: ${(props) => props.theme.dropdown?.hoverBg || 'rgba(255, 255, 255, 0.05)'};
    }

    &.active {
      background: ${(props) => props.theme.brand};
      color: #0D1117;
      font-weight: 600;
    }
  }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .select-arrow {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: ${(props) => props.theme.colors.text.muted};
  }

  .native-select {
    background: ${(props) => props.theme.requestTabPanel.url.bg};
    border: 1px solid ${(props) => props.theme.input.border};
    border-radius: 3px;
    color: ${(props) => props.theme.text};
    font-size: ${(props) => props.theme.font.size.sm};
    padding: 6px 28px 6px 10px;
    min-width: 140px;
    height: 32px;
    cursor: pointer;
    transition: all 0.2s ease;
    appearance: none;
    outline: none;
    box-shadow: none;

    &:hover {
      border-color: ${(props) => props.theme.input.focusBorder};
    }

    &:focus {
      outline: none;
      border-color: ${(props) => props.theme.input.focusBorder};
      box-shadow: 0 0 0 2px ${(props) => props.theme.input.focusBoxShadow};
    }

    option {
      background: ${(props) => props.theme.bg};
      color: ${(props) => props.theme.text};
      padding: 8px 12px;
    }
  }

  .library-options {
    display: flex;
    gap: 6px;
  }

  .lib-btn {
    height: 32px;
    padding: 0 12px;
    background: ${(props) => props.theme.requestTabPanel.url.bg};
    border: 1px solid ${(props) => props.theme.input.border};
    border-radius: 3px;
    color: ${(props) => props.theme.text};
    font-size: ${(props) => props.theme.font.size.sm};
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;

    &:hover {
      background: ${(props) => props.theme.dropdown.hoverBg};
      border-color: ${(props) => props.theme.input.focusBorder};
    }

    &.active {
      background: ${(props) => props.theme.button.secondary.bg};
      border-color: ${(props) => props.theme.button.secondary.border};
      color: ${(props) => props.theme.button.secondary.color};
    }
  }

  .right-controls {
    .interpolate-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: ${(props) => props.theme.font.size.base};
      color: ${(props) => props.theme.text};

      input[type="checkbox"] {
        cursor: pointer;
        margin: 0;
      }

      &:hover {
        opacity: 0.8;
      }
    }
  }
`;

export default StyledWrapper;
