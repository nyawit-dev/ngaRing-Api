import CodeEditor from 'components/CodeEditor/index';
import get from 'lodash/get';
import { useTheme } from 'providers/Theme/index';
import StyledWrapper from './StyledWrapper';
import { useSelector } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { IconCopy, IconCheck } from '@tabler/icons';
import { findCollectionByItemUid, getGlobalEnvironmentVariables, getGlobalEnvironmentVariablesMasked } from 'utils/collections/index';
import { cloneDeep } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { generateSnippet } from '../utils/snippet-generator';

const CodeView = ({ language, item }) => {
  const { displayedTheme } = useTheme();
  const preferences = useSelector((state) => state.app.preferences);
  const { globalEnvironments, activeGlobalEnvironmentUid } = useSelector((state) => state.globalEnvironments);
  const generateCodePrefs = useSelector((state) => state.app.generateCode);
  const [isCopied, setIsCopied] = useState(false);

  let collectionOriginal = findCollectionByItemUid(
    useSelector((state) => state.collections.collections),
    item.uid
  );

  const collection = useMemo(() => {
    const c = cloneDeep(collectionOriginal);
    const globalEnvironmentVariables = getGlobalEnvironmentVariables({
      globalEnvironments,
      activeGlobalEnvironmentUid
    });
    c.globalEnvironmentVariables = globalEnvironmentVariables;
    c.globalEnvSecrets = getGlobalEnvironmentVariablesMasked({ globalEnvironments, activeGlobalEnvironmentUid });
    c.globalEnvironments = globalEnvironments;
    c.activeGlobalEnvironmentUid = activeGlobalEnvironmentUid;
    return c;
  }, [collectionOriginal, globalEnvironments, activeGlobalEnvironmentUid]);

  // generateSnippet is async (EdgeGrid signs via Web Crypto), so the snippet is produced in an
  // effect; the cancelled flag drops results from a superseded render.
  const [snippet, setSnippet] = useState('');
  useEffect(() => {
    let cancelled = false;
    generateSnippet({
      language,
      item,
      collection,
      shouldInterpolate: generateCodePrefs.shouldInterpolate
    }).then((result) => {
      if (!cancelled) setSnippet(result);
    });
    return () => {
      cancelled = true;
    };
  }, [language, item, collection, generateCodePrefs.shouldInterpolate]);

  const handleCopy = () => {
    setIsCopied(true);
    toast.success('Snippet copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <StyledWrapper>
      <CopyToClipboard
        text={snippet}
        options={{ format: 'text/plain' }}
        onCopy={handleCopy}
      >
        <button
          className={`copy-to-clipboard-btn ${isCopied ? 'copied' : ''}`}
          type="button"
          aria-label="Copy code snippet to clipboard"
        >
          {isCopied ? <IconCheck size={14} strokeWidth={2} /> : <IconCopy size={14} strokeWidth={2} />}
          <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </CopyToClipboard>
      <div className="editor-content">
        <CodeEditor
          readOnly
          collection={collection}
          item={item}
          value={snippet}
          font={get(preferences, 'font.codeFont', 'default')}
          fontSize={get(preferences, 'font.codeFontSize')}
          theme={displayedTheme}
          mode={language.language}
          enableVariableHighlighting={true}
          showHintsFor={['variables']}
        />
      </div>
    </StyledWrapper>
  );
};

export default CodeView;
