import styled from 'styled-components';

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  font-size: ${(props) => props.theme.font.size.xs || '0.75rem'};
  font-weight: 500;
  font-family: var(--font-mono, monospace);
  padding: 0.1875rem 0.5rem;
  border-radius: 4px;
  line-height: 1.25;
  background: ${(props) => props.theme.sidebar?.badge?.bg || 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid ${(props) => props.theme.border?.border2 || 'rgba(255, 255, 255, 0.08)'};
  color: ${(props) => props.theme.colors?.text?.muted || props.theme.text};
  white-space: nowrap;
  transition: all 0.15s ease;

  .metric-icon {
    margin-right: 4px;
    opacity: 0.8;
    flex-shrink: 0;
  }
`;

export default Wrapper;
