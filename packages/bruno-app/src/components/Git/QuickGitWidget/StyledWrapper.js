import styled from 'styled-components';

const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background-color: ${(props) => props.theme.background.mantle};
  border: 1px solid ${(props) => props.theme.border.border0};
  border-radius: 6px;
  padding: 0.2rem 0.45rem;
  font-size: 0.75rem;
  user-select: none;
  max-width: 320px;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${(props) => props.theme.border.border1};
  }

  .branch-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    color: ${(props) => props.theme.text};
    cursor: pointer;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    transition: background-color 0.15s ease;
    min-width: 0;

    &:hover {
      background-color: ${(props) => props.theme.background.surface0};
      color: ${(props) => props.theme.primary.solid};
    }

    .branch-name {
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .dirty-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    font-size: 0.6875rem;
    font-weight: 600;
    color: #eab308;
    background-color: rgba(234, 179, 8, 0.12);
    padding: 0.1rem 0.35rem;
    border-radius: 10px;
    cursor: pointer;

    &:hover {
      background-color: rgba(234, 179, 8, 0.2);
    }
  }

  .ahead-behind {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    font-weight: 600;
    cursor: pointer;

    .ahead-count {
      color: #34d399;
      display: inline-flex;
      align-items: center;
    }

    .behind-count {
      color: #f87171;
      display: inline-flex;
      align-items: center;
    }
  }

  .quick-sync-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: ${(props) => props.theme.text.subtext1};
    padding: 0.15rem;
    border-radius: 4px;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      color: ${(props) => props.theme.text};
      background-color: ${(props) => props.theme.background.surface0};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

export default StyledWrapper;
