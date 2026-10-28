import React from 'react';
import StyledWrapper from './StyledWrapper';
import isNumber from 'lodash/isNumber';
import { formatDuration } from 'utils/common';
import { IconClock } from '@tabler/icons';

const ResponseTime = ({ duration }) => {
  if (!isNumber(duration)) {
    return null;
  }

  const speedClass = duration < 300 ? 'fast' : duration < 1000 ? 'moderate' : 'slow';

  return (
    <StyledWrapper className={`ml-2 ${speedClass}`} data-testid="response-time">
      <IconClock size={12} strokeWidth={2} className="metric-icon" aria-hidden="true" />
      <span>{formatDuration(duration)}</span>
    </StyledWrapper>
  );
};
export default ResponseTime;
