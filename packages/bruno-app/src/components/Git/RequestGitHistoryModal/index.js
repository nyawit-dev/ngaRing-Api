import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'components/Modal';
import Button from 'ui/Button';
import toast from 'react-hot-toast';
import {
  IconGitCommit,
  IconCopy,
  IconRefresh,
  IconCode,
  IconLayoutColumns,
  IconFileText,
  IconX
} from '@tabler/icons';
import {
  getGitRootPath,
  getGitFileHistory,
  getGitCommitFileDiff,
  getGitFileCommitVisualDiff
} from 'utils/git/gitClient';
import VisualDiffViewer from '../VisualDiffViewer';
import StyledWrapper from './StyledWrapper';

const RequestGitHistoryModal = ({ item, collection, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [diffMode, setDiffMode] = useState('visual'); // 'visual' or 'raw'
  const [diffLoading, setDiffLoading] = useState(false);
  const [rawDiffText, setRawDiffText] = useState('');
  const [visualData, setVisualData] = useState(null);
  const [relativeFilePath, setRelativeFilePath] = useState('');
  const [gitRoot, setGitRoot] = useState('');

  const calculateRelativePath = (rootPath, itemPath) => {
    if (!rootPath || !itemPath) return '';
    let normalizedRoot = rootPath.replace(/\\/g, '/').replace(/\/$/, '');
    let normalizedItem = itemPath.replace(/\\/g, '/');
    if (normalizedItem.startsWith(normalizedRoot)) {
      return normalizedItem.substring(normalizedRoot.length).replace(/^\//, '');
    }
    return item.filename || item.name || '';
  };

  const loadHistory = useCallback(async () => {
    if (!collection?.pathname || !item?.pathname) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const rootPath = await getGitRootPath(collection.pathname);
      if (!rootPath) {
        setCommits([]);
        setLoading(false);
        return;
      }
      setGitRoot(rootPath);
      const relPath = calculateRelativePath(rootPath, item.pathname);
      setRelativeFilePath(relPath);

      const history = await getGitFileHistory(rootPath, relPath);
      setCommits(history || []);
      if (history && history.length > 0) {
        setSelectedCommit(history[0]);
      }
    } catch (err) {
      console.error('Failed to load file history:', err);
      toast.error(`Failed to load history: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [collection?.pathname, item?.pathname]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const loadCommitDiff = useCallback(async (commit, rootPath, relPath, mode = diffMode) => {
    if (!commit || !rootPath || !relPath) return;
    try {
      setDiffLoading(true);
      if (mode === 'visual') {
        const result = await getGitFileCommitVisualDiff(rootPath, commit.hash, relPath);
        setVisualData(result);
      } else {
        const text = await getGitCommitFileDiff(rootPath, commit.hash, relPath);
        setRawDiffText(text || 'No text differences found for this commit.');
      }
    } catch (err) {
      console.error('Failed to load commit diff:', err);
      setRawDiffText(`Error loading diff: ${err.message}`);
    } finally {
      setDiffLoading(false);
    }
  }, [diffMode]);

  useEffect(() => {
    if (selectedCommit && gitRoot && relativeFilePath) {
      loadCommitDiff(selectedCommit, gitRoot, relativeFilePath, diffMode);
    }
  }, [selectedCommit, gitRoot, relativeFilePath, diffMode, loadCommitDiff]);

  const handleSelectCommit = (commit) => {
    setSelectedCommit(commit);
  };

  const renderDiffLines = (diffText) => {
    if (!diffText) return null;
    const lines = diffText.split('\n');
    return lines.map((line, idx) => {
      let lineClass = 'diff-line';
      if (line.startsWith('+') && !line.startsWith('+++')) {
        lineClass += ' diff-addition';
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        lineClass += ' diff-deletion';
      } else if (line.startsWith('@@') || line.startsWith('diff --git')) {
        lineClass += ' diff-header';
      }

      return (
        <div key={idx} className={lineClass}>
          {line || ' '}
        </div>
      );
    });
  };

  return (
    <Modal
      size="xl"
      title={`Git History: ${item.name}`}
      handleCancel={onClose}
      hideFooter={true}
      noPadding={true}
    >
      <StyledWrapper>
        {loading ? (
          <div className="p-8 flex flex-col gap-3">
            <div className="skeleton-shimmer w-64 h-5 rounded" />
            <div className="skeleton-shimmer w-full h-12 rounded" />
            <div className="skeleton-shimmer w-full h-12 rounded" />
            <div className="skeleton-shimmer w-full h-12 rounded" />
          </div>
        ) : commits.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            <IconFileText size={44} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-white mb-1">No Git History Found</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              This request file does not have any recorded Git commits yet, or the collection is not tracked by Git.
            </p>
          </div>
        ) : (
          <div className="history-modal-body">
            {/* Left Sidebar: Commits List */}
            <div className="commits-sidebar">
              <div className="history-sidebar-header">
                <span>Commits ({commits.length})</span>
                <span className="text-[11px] text-gray-400 font-mono truncate max-w-[140px]" title={relativeFilePath}>
                  {relativeFilePath}
                </span>
              </div>
              <div>
                {commits.map((c) => (
                  <div
                    key={c.hash}
                    className={`commit-item ${selectedCommit?.hash === c.hash ? 'selected' : ''}`}
                    onClick={() => handleSelectCommit(c)}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs truncate">
                        {c.message}
                      </span>
                      <span className="git-hash-badge">
                        {c.hash.slice(0, 7)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <div className="git-author-avatar">
                        {c.author_name ? c.author_name[0].toUpperCase() : 'G'}
                      </div>
                      <span className="truncate">{c.author_name}</span>
                      <span>•</span>
                      <span className="whitespace-nowrap">{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Pane: Diff View */}
            <div className="diff-main-pane">
              {selectedCommit && (
                <div className="git-diff-header-bar">
                  <div className="flex items-center gap-2 min-w-0">
                    <IconGitCommit size={16} className="text-yellow-500 flex-shrink-0" />
                    <span className="font-semibold text-xs truncate">
                      {selectedCommit.message}
                    </span>
                    <button
                      type="button"
                      className="p-1 hover:text-white text-gray-400 cursor-pointer"
                      title="Copy full commit SHA"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCommit.hash);
                        toast.success('Commit SHA copied');
                      }}
                    >
                      <IconCopy size={13} />
                    </button>
                  </div>

                  {/* Visual vs Raw Diff Toggle */}
                  <div className="git-toggle-pill-group">
                    <button
                      type="button"
                      className={`git-toggle-pill ${diffMode === 'visual' ? 'active' : ''}`}
                      onClick={() => setDiffMode('visual')}
                      title="Side-by-side visual comparison"
                    >
                      <IconLayoutColumns size={13} />
                      <span>Visual</span>
                    </button>
                    <button
                      type="button"
                      className={`git-toggle-pill ${diffMode === 'raw' ? 'active' : ''}`}
                      onClick={() => setDiffMode('raw')}
                      title="Raw unified diff"
                    >
                      <IconCode size={13} />
                      <span>Raw Diff</span>
                    </button>
                  </div>
                </div>
              )}

              {diffLoading ? (
                <div className="p-6 flex flex-col gap-3">
                  <div className="skeleton-shimmer w-40 h-4 rounded" />
                  <div className="skeleton-shimmer w-full h-4 rounded" />
                  <div className="skeleton-shimmer w-5/6 h-4 rounded" />
                  <div className="skeleton-shimmer w-3/4 h-4 rounded" />
                </div>
              ) : diffMode === 'visual' && visualData ? (
                <div className="visual-diff-wrapper">
                  <VisualDiffViewer
                    oldData={visualData.oldParsed}
                    newData={visualData.newParsed}
                    oldLabel="Parent Commit"
                    newLabel="This Commit"
                  />
                </div>
              ) : (
                <div className="diff-view-content">
                  {renderDiffLines(rawDiffText)}
                </div>
              )}
            </div>
          </div>
        )}
      </StyledWrapper>
    </Modal>
  );
};

export default RequestGitHistoryModal;
