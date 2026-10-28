import styled from 'styled-components';

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  font-size: ${(props) => props.theme.font.size.xs || '0.75rem'};
  font-weight: 600;
  font-family: var(--font-mono, monospace);
  white-space: nowrap;
  padding: 0.1875rem 0.5rem;
  border-radius: 4px;
  line-height: 1.25;
  letter-spacing: 0.02em;
  transition: all 0.15s ease;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
    flex-shrink: 0;
  }

  &.text-ok {
    color: #10B981;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.25);
    .status-dot {
      background: #10B981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
    }
  }

  &.text-redirect {
    color: #06B6D4;
    background: rgba(6, 182, 212, 0.1);
    border: 1px solid rgba(6, 182, 212, 0.25);
    .status-dot {
      background: #06B6D4;
      box-shadow: 0 0 6px rgba(6, 182, 212, 0.5);
    }
  }

  &.text-client-error {
    color: #F59E0B;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.25);
    .status-dot {
      background: #F59E0B;
      box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
    }
  }

  &.text-error {
    color: #F43F5E;
    background: rgba(244, 63, 94, 0.1);
    border: 1px solid rgba(244, 63, 94, 0.25);
    .status-dot {
      background: #F43F5E;
      box-shadow: 0 0 6px rgba(244, 63, 94, 0.5);
    }
  }
`;

export default Wrapper;
