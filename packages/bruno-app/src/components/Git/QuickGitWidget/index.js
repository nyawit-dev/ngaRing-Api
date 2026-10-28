import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    let isMounted = true;
    if (!collection?.pathname) {
      return () => {
        isMounted = false;
      };
    }

    getGitStatus(collection.pathname)
      .then((status) => {
        if (isMounted) setGitStatus(status?.isGit ? status : null);
      })
      .catch((err) => {
        console.error('Failed to load quick Git status:', err);
        if (isMounted) setGitStatus(null);
      });

    return () => {
      isMounted = false;
    };
  }, [collection?.pathname]);

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
      const fetchedStatus = await getGitStatus(collection.pathname, { forceRefresh: true });
      const fetchedBehind = fetchedStatus?.aheadBehind?.behind || 0;
      if (fetchedBehind > 0) {
        await pullGit(
          gitStatus.gitRootPath,
          'origin',
          fetchedStatus.currentGitBranch || currentBranch,
          '--no-rebase'
        );
        toast.success(`Pulled ${fetchedBehind} new commit(s) from remote`);
        const updatedStatus = await getGitStatus(collection.pathname, { forceRefresh: true });
        setGitStatus(updatedStatus?.isGit ? updatedStatus : null);
      } else {
        toast.success('Branch up-to-date with remote');
        setGitStatus(fetchedStatus?.isGit ? fetchedStatus : null);
      }
    } catch (err) {
      toast.error(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <StyledWrapper title={`Git Branch: ${currentBranch}`}>
      <button type="button" className="branch-pill" onClick={onOpenGitModal}>
        <IconGitBranch size={13} className="text-yellow-500 flex-shrink-0" />
        <span className="branch-name">{currentBranch}</span>
      </button>

      {totalChanges > 0 && (
        <button
          type="button"
          className="dirty-pill flex items-center gap-1"
          onClick={onOpenGitModal}
          title={`${totalChanges} uncommitted change(s)`}
          aria-label={`Open Git changes, ${totalChanges} uncommitted change(s)`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          <span>{totalChanges}</span>
        </button>
      )}

      {(ahead > 0 || behind > 0) && (
        <button
          type="button"
          className="ahead-behind"
          onClick={onOpenGitModal}
          aria-label={`Open Git status, ${ahead} commit(s) ahead and ${behind} behind`}
        >
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
        </button>
      )}

      <button
        type="button"
        className="quick-sync-btn"
        onClick={handleQuickSync}
        disabled={isSyncing}
        title="Quick Fetch & Sync"
        aria-label="Fetch and sync Git changes"
        aria-busy={isSyncing}
      >
        <IconRefresh size={12} className={isSyncing ? 'animate-spin text-yellow-500' : ''} />
      </button>
    </StyledWrapper>
  );
};

export default QuickGitWidget;
