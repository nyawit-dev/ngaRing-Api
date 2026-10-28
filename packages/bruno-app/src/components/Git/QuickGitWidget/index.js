import React, { useState, useEffect, useCallback } from 'react';
import {
  IconGitBranch,
  IconArrowUp,
  IconArrowDown,
  IconRefresh
} from '@tabler/icons';
import { getGitStatus, fetchGit, pullGit } from 'utils/git/gitClient';
import toast from 'react-hot-toast';
import StyledWrapper from './StyledWrapper';

const QuickGitWidget = ({ collection, onOpenGitModal }) => {
  const [gitStatus, setGitStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!collection?.pathname) return;
    try {
      const status = await getGitStatus(collection.pathname);
      if (status?.isGit) {
        setGitStatus(status);
      } else {
        setGitStatus(null);
      }
    } catch (err) {
      // Non-intrusive failure
      setGitStatus(null);
    }
  }, [collection?.pathname]);

  useEffect(() => {
    fetchStatus();
    // Periodically update quick status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (!gitStatus || !gitStatus.isGit) {
    return null;
  }

  const totalChanges = (gitStatus.staged?.length || 0) + (gitStatus.unstaged?.length || 0);
  const ahead = gitStatus.aheadBehind?.ahead || 0;
  const behind = gitStatus.aheadBehind?.behind || 0;
  const currentBranch = gitStatus.currentGitBranch || 'main';

  const handleQuickSync = async (e) => {
    e.stopPropagation();
    if (!gitStatus.gitRootPath) return;

    try {
      setIsSyncing(true);
      await fetchGit(gitStatus.gitRootPath, 'origin');
      if (behind > 0) {
        await pullGit(gitStatus.gitRootPath, 'origin', currentBranch, '--no-rebase');
        toast.success(`Pulled ${behind} new commit(s) from remote`);
      } else {
        toast.success('Branch up-to-date with remote');
      }
      await fetchStatus();
    } catch (err) {
      toast.error(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <StyledWrapper title={`Git Branch: ${currentBranch}`}>
      <div className="branch-pill" onClick={onOpenGitModal}>
        <IconGitBranch size={13} className="text-yellow-500 flex-shrink-0" />
        <span className="branch-name">{currentBranch}</span>
      </div>

      {totalChanges > 0 && (
        <div
          className="dirty-pill flex items-center gap-1"
          onClick={onOpenGitModal}
          title={`${totalChanges} uncommitted change(s)`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          <span>{totalChanges}</span>
        </div>
      )}

      {(ahead > 0 || behind > 0) && (
        <div className="ahead-behind" onClick={onOpenGitModal}>
          {ahead > 0 && (
            <span className="ahead-count" title={`${ahead} commit(s) ahead of remote`}>
              <IconArrowUp size={12} />
              {ahead}
            </span>
          )}
          {behind > 0 && (
            <span className="behind-count" title={`${behind} commit(s) behind remote`}>
              <IconArrowDown size={12} />
              {behind}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        className="quick-sync-btn"
        onClick={handleQuickSync}
        disabled={isSyncing}
        title="Quick Fetch & Sync"
      >
        <IconRefresh size={12} className={isSyncing ? 'animate-spin text-yellow-500' : ''} />
      </button>
    </StyledWrapper>
  );
};

export default QuickGitWidget;
