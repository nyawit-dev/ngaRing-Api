import styled from 'styled-components';

const StyledWrapper = styled.div`
  height: 100%;
  position: relative;

  .editor-content {
    height: 100%;

    .CodeMirror {
      height: 100%;
      font-size: ${(props) => props.theme.font.size.sm};
      background: ${(props) => props.theme.modal.bg};
      line-height: 1.5;
      padding: 0;
      background: transparent !important;
      border: none;

      .CodeMirror-gutters {
        background: transparent !important;
        border-right: none;
      }

      .CodeMirror-linenumber {
        color: ${(props) => props.theme.colors.text.muted};
        font-size: ${(props) => props.theme.font.size.xs};
        padding: 0 3px 0 5px;
      }

      .CodeMirror-lines {
        padding: 0;
      }

      .CodeMirror-line {
        padding: 0 4px;
      }
    }
  }

  .copy-to-clipboard-btn {
    position: absolute;
    top: 10px;
    right: 14px;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: ${(props) => props.theme.dropdown?.bg || 'rgba(0, 0, 0, 0.4)'};
    border: 1px solid ${(props) => props.theme.border?.border2 || 'rgba(255, 255, 255, 0.12)'};
    color: ${(props) => props.theme.text};
    border-radius: 4px;
    font-size: ${(props) => props.theme.font.size.xs || '0.75rem'};
    font-weight: 500;
    cursor: pointer;
    padding: 5px 10px;
    transition: all 0.15s ease;

    &:hover {
      border-color: ${(props) => props.theme.brand};
      color: ${(props) => props.theme.brand};
      background: ${(props) => props.theme.dropdown?.hoverBg || 'rgba(0, 240, 255, 0.08)'};
    }

    &.copied {
      color: #10B981;
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.1);
    }

    &:active {
      transform: translateY(1px);
    }
  }

  .copy-to-clipboard {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    background: transparent;
    border: none;
    color: ${(props) => props.theme.colors.text.muted};
    cursor: pointer;
    padding: 6px;
    opacity: 0.7;
    transition: all 0.2s ease;

    &:hover {
      opacity: 1;
      color: ${(props) => props.theme.text};
    }

    &:active {
      transform: translateY(1px);
    }
  }
`;

export default StyledWrapper;
