import React from 'react';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import VisualDiffContent from './VisualDiffContent';
import VisualDiffUrlBar from './VisualDiffUrlBar';
import VisualDiffHeaders from './VisualDiffHeaders';
import VisualDiffParams from './VisualDiffParams';
import VisualDiffAuth from './VisualDiffAuth';
import VisualDiffBody from './VisualDiffBody';
import { getMethod, getUrl } from './utils/bruUtils';

const SECTIONS = [
  {
    key: 'url',
    title: 'URL & Method',
    Component: VisualDiffUrlBar,
    hasContent: (data) => Boolean(getUrl(data) || getMethod(data))
  },
  {
    key: 'params',
    title: 'Parameters',
    Component: VisualDiffParams,
    hasContent: (data) => (get(data, 'request.params', []) || []).length > 0
  },
  {
    key: 'headers',
    title: 'Headers',
    Component: VisualDiffHeaders,
    hasContent: (data) => (get(data, 'request.headers', []) || []).length > 0
  },
  {
    key: 'auth',
    title: 'Authentication',
    Component: VisualDiffAuth,
    hasContent: (data) => {
      const auth = get(data, 'request.auth', {});
      return Boolean(auth && auth.mode && auth.mode !== 'none');
    }
  },
  {
    key: 'body',
    title: 'Body',
    Component: VisualDiffBody,
    hasContent: (data) => {
      const body = get(data, 'request.body', {});
      return Boolean(body && body.mode && body.mode !== 'none');
    }
  }
];

const checkSectionChanges = (key, oldData, newData) => {
  if (key === 'url') {
    return getMethod(oldData) !== getMethod(newData) || getUrl(oldData) !== getUrl(newData);
  }
  if (key === 'params') {
    return !isEqual(get(oldData, 'request.params', []), get(newData, 'request.params', []));
  }
  if (key === 'headers') {
    return !isEqual(get(oldData, 'request.headers', []), get(newData, 'request.headers', []));
  }
  if (key === 'auth') {
    return !isEqual(get(oldData, 'request.auth', {}), get(newData, 'request.auth', {}));
  }
  if (key === 'body') {
    return !isEqual(get(oldData, 'request.body', {}), get(newData, 'request.body', {}));
  }
  return false;
};

const VisualDiffViewer = ({ oldData, newData, oldLabel = 'Before', newLabel = 'After' }) => {
  return (
    <VisualDiffContent
      oldData={oldData}
      newData={newData}
      sections={SECTIONS}
      sectionHasChanges={checkSectionChanges}
      oldLabel={oldLabel}
      newLabel={newLabel}
    />
  );
};

export default VisualDiffViewer;
