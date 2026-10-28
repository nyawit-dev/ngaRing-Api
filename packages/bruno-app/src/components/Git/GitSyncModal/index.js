import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Modal from 'components/Modal';
import Button from 'ui/Button';
import toast from 'react-hot-toast';
import {
  IconBrandGit,
  IconGitBranch,
  IconGitCommit,
  IconGitPullRequest,
  IconBrandGithub,
  IconArrowUp,
  IconArrowDown,
  IconPlus,
  IconMinus,
  IconTrash,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconExternalLink,
  IconCopy,
  IconLock,
  IconEye,
  IconEyeOff,
  IconCloudDownload,
  IconArchive,
  IconCode,
  IconLayoutColumns,
  IconSearch,
  IconRotate2,
  IconFolder,
  IconMaximize,
  IconMinimize
} from '@tabler/icons';
import {
  getGitStatus,
  getCachedGitStatus,
  subscribeGitStatus,
  stageGitFiles,
  unstageGitFiles,
  discardGitFiles,
  commitGit,
  pushGit,
  pullGit,
  fetchGit,
  checkoutGitBranch,
  deleteGitBranch,
  getGitDiff,
  initGitRepo,
  addGitRemote,
  verifyGitHubToken,
  saveGitHubAuth,
  getGitHubAuth,
  logoutGitHub,
  getGitLogs,
  createGitStash,
  listGitStashes,
  applyGitStash,
  dropGitStash,
  getGitStashFiles,
  getGitStashDiff,
  getGitCommitFiles,
  getGitCommitFileDiff,
  getGitVisualDiff,
  abortGitMerge
} from 'utils/git/gitClient';
import VisualDiffViewer from '../VisualDiffViewer';
import StyledWrapper from './StyledWrapper';

const GITHUB_TOKEN_CREATE_URL = 'https://github.com/settings/tokens/new?scopes=repo&description=NgaRingApi%20Git%20Client';

const GitSyncModal = ({ collection, onClose }) => {
  const collectionPath = collection?.pathname;
  const initialCache = getCachedGitStatus(collectionPath);

  const [activeTab, setActiveTab] = useState('changes');
  const [isMaximized, setIsMaximized] = useState(false);
  const [gitStatus, setGitStatus] = useState(initialCache);
  const [loading, setLoading] = useState(!initialCache);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  // Changes / Diff state
  const [selectedFile, setSelectedFile] = useState(null);
  const [diffViewMode, setDiffViewMode] = useState('raw'); // 'raw' or 'visual'
  const [fileDiff, setFileDiff] = useState('');
  const [visualDiffData, setVisualDiffData] = useState(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [isCopiedDiff, setIsCopiedDiff] = useState(false);

  // Sync operations state
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Branch switcher state
  const [isBranchLoading, setIsBranchLoading] = useState(false);
  const [showNewBranchInput, setShowNewBranchInput] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  // Remote configuration state
  const [remoteUrlInput, setRemoteUrlInput] = useState(initialCache?.gitRepoUrl || '');
  const [isSavingRemote, setIsSavingRemote] = useState(false);

  // Stash state (lazy-loaded)
  const [stashes, setStashes] = useState([]);
  const [stashesLoading, setStashesLoading] = useState(false);
  const [stashesLoaded, setStashesLoaded] = useState(false);
  const [stashMessageInput, setStashMessageInput] = useState('');
  const [isStashing, setIsStashing] = useState(false);
  const [selectedStashIndex, setSelectedStashIndex] = useState(null);
  const [stashFiles, setStashFiles] = useState([]);
  const [stashDiffText, setStashDiffText] = useState('');

  // History state (lazy-loaded)
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [commitFiles, setCommitFiles] = useState([]);
  const [selectedCommitFile, setSelectedCommitFile] = useState(null);
  const [commitFileDiff, setCommitFileDiff] = useState('');
  const [commitDiffLoading, setCommitDiffLoading] = useState(false);

  // GitHub Auth state (lazy-loaded)
  const [githubAuth, setGithubAuth] = useState(null);
  const [githubAuthLoaded, setGithubAuthLoaded] = useState(false);
  const [githubAuthLoading, setGithubAuthLoading] = useState(false);
  const [githubTokenInput, setGithubTokenInput] = useState('');
  const [showTokenText, setShowTokenText] = useState(false);
  const [isVerifyingGithub, setIsVerifyingGithub] = useState(false);

  const isRequestFile = (filePath) => {
    if (!filePath) return false;
    return filePath.endsWith('.bru') || filePath.endsWith('.yml');
  };

  const handleCopyDiff = () => {
    if (!fileDiff) return;
    navigator.clipboard.writeText(fileDiff);
    setIsCopiedDiff(true);
    toast.success('Diff copied to clipboard');
    setTimeout(() => setIsCopiedDiff(false), 2000);
  };

  const handleInsertPrefix = (prefix) => {
    setCommitMessage((prev) => {
      const cleaned = prev.replace(/^(feat|fix|docs|chore|refactor|test|style|perf)(\([a-z0-9_-]+\))?:\s*/, '');
      return `${prefix}: ${cleaned}`;
    });
  };

  const diffStats = useMemo(() => {
    if (!fileDiff) return { additions: 0, deletions: 0 };
    let additions = 0;
    let deletions = 0;
    const lines = fileDiff.split('\n');
    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) additions++;
      else if (line.startsWith('-') && !line.startsWith('---')) deletions++;
    }
    return { additions, deletions };
  }, [fileDiff]);

  const filteredStaged = useMemo(() => {
    const list = gitStatus?.staged || [];
    if (!fileSearchQuery.trim()) return list;
    const q = fileSearchQuery.toLowerCase();
    return list.filter((f) => f.path.toLowerCase().includes(q));
  }, [gitStatus?.staged, fileSearchQuery]);

  const filteredUnstaged = useMemo(() => {
    const list = gitStatus?.unstaged || [];
    if (!fileSearchQuery.trim()) return list;
    const q = fileSearchQuery.toLowerCase();
    return list.filter((f) => f.path.toLowerCase().includes(q));
  }, [gitStatus?.unstaged, fileSearchQuery]);

  const filteredConflicted = useMemo(() => {
    const list = gitStatus?.conflicted || [];
    if (!fileSearchQuery.trim()) return list;
    const q = fileSearchQuery.toLowerCase();
    return list.filter((f) => f.path.toLowerCase().includes(q));
  }, [gitStatus?.conflicted, fileSearchQuery]);

  // -------------------------------------------------------------
  // Fast Stale-While-Revalidate Status Fetching
  // -------------------------------------------------------------
  const fetchStatus = useCallback(async (forceRefresh = false) => {
    if (!collectionPath) return;
    try {
      if (gitStatus) {
        setIsRefreshingStatus(true);
      } else {
        setLoading(true);
      }
      setErrorBanner(null);
      const status = await getGitStatus(collectionPath, { forceRefresh });
      if (status) {
        setGitStatus(status);
        if (status.gitRepoUrl && !remoteUrlInput) {
          setRemoteUrlInput(status.gitRepoUrl);
        }
      }
    } catch (err) {
      console.error('Failed to load git status:', err);
      setErrorBanner(err.message || 'Failed to inspect Git status');
    } finally {
      setLoading(false);
      setIsRefreshingStatus(false);
    }
  }, [collectionPath, gitStatus, remoteUrlInput]);

  // Mount effect: subscribe to status updates and trigger background revalidation
  useEffect(() => {
    fetchStatus(false);
    const unsubscribe = subscribeGitStatus((path, status) => {
      if (path === collectionPath && status) {
        setGitStatus(status);
        setIsRefreshingStatus(false);
      }
    });
    return unsubscribe;
  }, [collectionPath]);

  // Diff loader
  const loadDiff = useCallback(async (file, rootPath, mode = diffViewMode) => {
    if (!file || !rootPath) return;
    try {
      setDiffLoading(true);
      if (mode === 'visual' && isRequestFile(file.path)) {
        const visualResult = await getGitVisualDiff(rootPath, file.path, file.type || 'unstaged');
        setVisualDiffData(visualResult);
      } else {
        const diff = await getGitDiff(rootPath, file.path, file.type === 'staged');
        setFileDiff(diff || 'No visible differences found.');
      }
    } catch (err) {
      console.error('Failed to fetch diff:', err);
      setFileDiff(`Error loading diff: ${err.message}`);
    } finally {
      setDiffLoading(false);
    }
  }, [diffViewMode]);

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    if (gitStatus?.gitRootPath) {
      loadDiff(file, gitStatus.gitRootPath, diffViewMode);
    }
  };

  const handleToggleDiffMode = (mode) => {
    setDiffViewMode(mode);
    if (selectedFile && gitStatus?.gitRootPath) {
      loadDiff(selectedFile, gitStatus.gitRootPath, mode);
    }
  };

  // -------------------------------------------------------------
  // Staging / Unstaging / Discard Actions
  // -------------------------------------------------------------
  const handleStage = async (file, e) => {
    e?.stopPropagation();
    if (!gitStatus?.gitRootPath) return;
    try {
      await stageGitFiles(gitStatus.gitRootPath, [file.path]);
      await fetchStatus(true);
      if (selectedFile?.path === file.path) {
        const updated = { ...file, type: 'staged' };
        setSelectedFile(updated);
        loadDiff(updated, gitStatus.gitRootPath);
      }
    } catch (err) {
      toast.error(`Failed to stage file: ${err.message}`);
    }
  };

  const handleStageAll = async () => {
    if (!gitStatus?.gitRootPath || !gitStatus?.unstaged?.length) return;
    try {
      const paths = gitStatus.unstaged.map((f) => f.path);
      await stageGitFiles(gitStatus.gitRootPath, paths);
      toast.success('All changes staged');
      await fetchStatus(true);
      if (selectedFile) {
        const updated = { ...selectedFile, type: 'staged' };
        setSelectedFile(updated);
        loadDiff(updated, gitStatus.gitRootPath);
      }
    } catch (err) {
      toast.error(`Failed to stage all files: ${err.message}`);
    }
  };

  const handleUnstage = async (file, e) => {
    e?.stopPropagation();
    if (!gitStatus?.gitRootPath) return;
    try {
      await unstageGitFiles(gitStatus.gitRootPath, [file.path]);
      await fetchStatus(true);
      if (selectedFile?.path === file.path) {
        const updated = { ...file, type: 'unstaged' };
        setSelectedFile(updated);
        loadDiff(updated, gitStatus.gitRootPath);
      }
    } catch (err) {
      toast.error(`Failed to unstage file: ${err.message}`);
    }
  };

  const handleUnstageAll = async () => {
    if (!gitStatus?.gitRootPath || !gitStatus?.staged?.length) return;
    try {
      const paths = gitStatus.staged.map((f) => f.path);
      await unstageGitFiles(gitStatus.gitRootPath, paths);
      toast.success('All files unstaged');
      await fetchStatus(true);
      if (selectedFile) {
        const updated = { ...selectedFile, type: 'unstaged' };
        setSelectedFile(updated);
        loadDiff(updated, gitStatus.gitRootPath);
      }
    } catch (err) {
      toast.error(`Failed to unstage all files: ${err.message}`);
    }
  };

  const handleDiscard = async (file, e) => {
    e?.stopPropagation();
    if (!gitStatus?.gitRootPath) return;
    const confirmed = window.confirm(`Are you sure you want to discard changes in "${file.path}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await discardGitFiles(gitStatus.gitRootPath, [file.path]);
      toast.success(`Discarded changes in ${file.path}`);
      if (selectedFile?.path === file.path) {
        setSelectedFile(null);
        setFileDiff('');
        setVisualDiffData(null);
      }
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Failed to discard changes: ${err.message}`);
    }
  };

  const handleDiscardAll = async () => {
    if (!gitStatus?.gitRootPath || !gitStatus?.unstaged?.length) return;
    const count = gitStatus.unstaged.length;
    const confirmed = window.confirm(`Discard all ${count} uncommitted change(s)? This will permanently revert local changes.`);
    if (!confirmed) return;
    try {
      const paths = gitStatus.unstaged.map((f) => f.path);
      await discardGitFiles(gitStatus.gitRootPath, paths);
      toast.success('All unstaged changes discarded');
      setSelectedFile(null);
      setFileDiff('');
      setVisualDiffData(null);
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Failed to discard changes: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // Commit Action
  // -------------------------------------------------------------
  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      toast.error('Please enter a commit message');
      return;
    }
    if (!gitStatus?.staged?.length) {
      toast.error('No staged changes to commit. Stage files first.');
      return;
    }
    try {
      setIsCommitting(true);
      await commitGit(gitStatus.gitRootPath, commitMessage.trim());
      toast.success('Committed changes successfully');
      setCommitMessage('');
      setSelectedFile(null);
      setFileDiff('');
      setVisualDiffData(null);
      await fetchStatus(true);
      // Invalidate history so next time it refreshes
      setHistoryLoaded(false);
    } catch (err) {
      toast.error(`Commit failed: ${err.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  // -------------------------------------------------------------
  // Remote Sync Actions (Fetch, Pull, Push)
  // -------------------------------------------------------------
  const handleFetch = async () => {
    if (!gitStatus?.gitRootPath) return;
    try {
      setIsFetching(true);
      await fetchGit(gitStatus.gitRootPath, 'origin');
      toast.success('Fetched remote references');
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Fetch failed: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  const handlePull = async () => {
    if (!gitStatus?.gitRootPath) return;
    try {
      setIsPulling(true);
      const res = await pullGit(gitStatus.gitRootPath, 'origin', gitStatus.currentGitBranch || 'main');
      if (res?.conflicts && res.conflicts.length > 0) {
        toast.error(`Merge conflict in ${res.conflicts.length} file(s)!`);
      } else {
        toast.success('Successfully pulled from remote');
      }
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Pull failed: ${err.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  const handlePush = async () => {
    if (!gitStatus?.gitRootPath) return;
    try {
      setIsPushing(true);
      await pushGit(gitStatus.gitRootPath, 'origin', gitStatus.currentGitBranch || 'main');
      toast.success('Pushed commits to remote successfully');
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Push failed: ${err.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  // -------------------------------------------------------------
  // Branch Operations
  // -------------------------------------------------------------
  const handleBranchSwitch = async (branchName) => {
    if (!branchName || branchName === gitStatus?.currentGitBranch) return;
    try {
      setIsBranchLoading(true);
      await checkoutGitBranch(gitStatus.gitRootPath, branchName, false);
      toast.success(`Switched to branch "${branchName}"`);
      setSelectedFile(null);
      setFileDiff('');
      setVisualDiffData(null);
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Failed to switch branch: ${err.message}`);
    } finally {
      setIsBranchLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    const trimmed = newBranchName.trim();
    if (!trimmed) return;
    try {
      setIsBranchLoading(true);
      await checkoutGitBranch(gitStatus.gitRootPath, trimmed, true);
      toast.success(`Created & checked out branch "${trimmed}"`);
      setNewBranchName('');
      setShowNewBranchInput(false);
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Failed to create branch: ${err.message}`);
    } finally {
      setIsBranchLoading(false);
    }
  };

  const handleDeleteBranch = async (branchName) => {
    if (!branchName || branchName === gitStatus?.currentGitBranch) return;
    const confirmed = window.confirm(`Delete local branch "${branchName}"?`);
    if (!confirmed) return;
    try {
      setIsBranchLoading(true);
      await deleteGitBranch(gitStatus.gitRootPath, branchName);
      toast.success(`Deleted branch "${branchName}"`);
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Failed to delete branch: ${err.message}`);
    } finally {
      setIsBranchLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Merge Conflict Abort
  // -------------------------------------------------------------
  const handleAbortMerge = async () => {
    if (!gitStatus?.gitRootPath) return;
    const confirmed = window.confirm('Abort the in-progress merge? Unmerged changes will be reset.');
    if (!confirmed) return;
    try {
      await abortGitMerge(gitStatus.gitRootPath);
      toast.success('Merge aborted successfully');
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Failed to abort merge: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // Lazy-loaded Tab Handlers (History, Stashes, GitHub Auth)
  // -------------------------------------------------------------
  const loadHistoryLogs = async (limit = 50) => {
    if (!gitStatus?.gitRootPath) return;
    try {
      setHistoryLoading(true);
      const logs = await getGitLogs(gitStatus.gitRootPath, limit, 0);
      setHistoryLogs(logs || []);
      setHistoryLoaded(true);
      if (logs && logs.length > 0 && !selectedCommit) {
        handleSelectCommit(logs[0]);
      }
    } catch (err) {
      console.error('Failed to load commit history:', err);
      toast.error(`Failed to load commit history: ${err.message}`);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectCommit = async (commit) => {
    setSelectedCommit(commit);
    setSelectedCommitFile(null);
    setCommitFileDiff('');
    if (!gitStatus?.gitRootPath || !commit?.hash) return;
    try {
      const files = await getGitCommitFiles(gitStatus.gitRootPath, commit.hash);
      setCommitFiles(files || []);
      if (files && files.length > 0) {
        handleSelectCommitFile(commit.hash, files[0]);
      }
    } catch (err) {
      console.error('Failed to load commit files:', err);
    }
  };

  const handleSelectCommitFile = async (commitHash, file) => {
    setSelectedCommitFile(file);
    if (!gitStatus?.gitRootPath || !commitHash || !file?.path) return;
    try {
      setCommitDiffLoading(true);
      const diff = await getGitCommitFileDiff(gitStatus.gitRootPath, commitHash, file.path);
      setCommitFileDiff(diff || 'No text differences.');
    } catch (err) {
      setCommitFileDiff(`Error: ${err.message}`);
    } finally {
      setCommitDiffLoading(false);
    }
  };

  const loadStashes = async () => {
    if (!gitStatus?.gitRootPath) return;
    try {
      setStashesLoading(true);
      const list = await listGitStashes(gitStatus.gitRootPath);
      setStashes(list || []);
      setStashesLoaded(true);
    } catch (err) {
      console.error('Failed to load stashes:', err);
      toast.error(`Failed to load stashes: ${err.message}`);
    } finally {
      setStashesLoading(false);
    }
  };

  const handleCreateStash = async () => {
    if (!gitStatus?.gitRootPath) return;
    const msg = stashMessageInput.trim() || `Stash on ${gitStatus.currentGitBranch || 'main'} (${new Date().toLocaleTimeString()})`;
    try {
      setIsStashing(true);
      await createGitStash(gitStatus.gitRootPath, msg);
      toast.success('Working changes stashed successfully');
      setStashMessageInput('');
      setSelectedFile(null);
      setFileDiff('');
      setVisualDiffData(null);
      await fetchStatus(true);
      await loadStashes();
    } catch (err) {
      toast.error(`Failed to stash changes: ${err.message}`);
    } finally {
      setIsStashing(false);
    }
  };

  const handleApplyStash = async (index) => {
    if (!gitStatus?.gitRootPath) return;
    try {
      await applyGitStash(gitStatus.gitRootPath, index);
      toast.success(`Stash @{${index}} applied`);
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Failed to apply stash: ${err.message}`);
    }
  };

  const handleDropStash = async (index) => {
    if (!gitStatus?.gitRootPath) return;
    const confirmed = window.confirm(`Drop stash @{${index}}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await dropGitStash(gitStatus.gitRootPath, index);
      toast.success(`Stash @{${index}} dropped`);
      await loadStashes();
    } catch (err) {
      toast.error(`Failed to drop stash: ${err.message}`);
    }
  };

  const loadGithubAuth = async () => {
    setGithubAuthLoading(true);
    try {
      const auth = await getGitHubAuth();
      setGithubAuth(auth || null);
      setGithubAuthLoaded(true);
    } catch (err) {
      console.error('Failed to load GitHub auth:', err);
    } finally {
      setGithubAuthLoading(false);
    }
  };

  const handleVerifyAndSaveGithub = async () => {
    const cleanToken = githubTokenInput.trim();
    if (!cleanToken) {
      toast.error('Please enter a GitHub Personal Access Token');
      return;
    }
    try {
      setIsVerifyingGithub(true);
      const authData = await verifyGitHubToken(cleanToken);
      await saveGitHubAuth(authData);
      setGithubAuth(authData);
      setGithubTokenInput('');
      toast.success(`Connected as @${authData.user.login}`);
    } catch (err) {
      toast.error(`GitHub Auth failed: ${err.message}`);
    } finally {
      setIsVerifyingGithub(false);
    }
  };

  const handleLogoutGithub = async () => {
    try {
      await logoutGitHub();
      setGithubAuth(null);
      toast.success('Disconnected GitHub account');
    } catch (err) {
      toast.error(`Logout failed: ${err.message}`);
    }
  };

  const handleSaveRemote = async () => {
    const url = remoteUrlInput.trim();
    if (!url || !gitStatus?.gitRootPath) return;
    try {
      setIsSavingRemote(true);
      await addGitRemote(gitStatus.gitRootPath, url, 'origin');
      toast.success('Remote origin configured');
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Failed to set remote: ${err.message}`);
    } finally {
      setIsSavingRemote(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'history' && !historyLoaded) {
      loadHistoryLogs();
    }
    if (tab === 'stash' && !stashesLoaded) {
      loadStashes();
    }
    if (tab === 'github' && !githubAuthLoaded) {
      loadGithubAuth();
    }
  };

  const handleInitRepo = async () => {
    try {
      setLoading(true);
      await initGitRepo(collectionPath);
      toast.success('Git repository initialized successfully');
      await fetchStatus(true);
    } catch (err) {
      toast.error(`Failed to initialize repository: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtered history commits
  const filteredHistoryLogs = useMemo(() => {
    if (!historySearchQuery.trim()) return historyLogs;
    const query = historySearchQuery.toLowerCase();
    return historyLogs.filter(
      (c) =>
        (c.message && c.message.toLowerCase().includes(query)) ||
        (c.author_name && c.author_name.toLowerCase().includes(query)) ||
        (c.hash && c.hash.toLowerCase().includes(query))
    );
  }, [historyLogs, historySearchQuery]);

  const totalChangesCount = (gitStatus?.staged?.length || 0) + (gitStatus?.unstaged?.length || 0);
  const aheadCount = gitStatus?.aheadBehind?.ahead || 0;
  const behindCount = gitStatus?.aheadBehind?.behind || 0;
  const isRepoInitialized = Boolean(gitStatus?.isGit && gitStatus?.gitRootPath);

  // Helper to split file directory from filename
  const formatFilePath = (filePath) => {
    const lastSlash = filePath.lastIndexOf('/');
    if (lastSlash === -1) {
      return { dir: '', name: filePath };
    }
    return {
      dir: filePath.substring(0, lastSlash + 1),
      name: filePath.substring(lastSlash + 1)
    };
  };

  // -------------------------------------------------------------
  // Render: Initial Skeleton (Only if completely uncached on open)
  // -------------------------------------------------------------
  if (loading && !gitStatus) {
    return (
      <Modal
        size="git"
        hideHeader={true}
        hideClose={true}
        handleCancel={onClose}
        hideFooter={true}
        noPadding={true}
        disableCloseOnOutsideClick={true}
      >
        <StyledWrapper>
          <div className="git-skeleton-shell" role="status" aria-live="polite">
            <div className="sk-header">
              <div className="skeleton-shimmer" style={{ width: '180px', height: '28px' }} />
              <div className="skeleton-shimmer" style={{ width: '260px', height: '28px' }} />
              <div className="skeleton-shimmer" style={{ width: '140px', height: '28px' }} />
            </div>
            <div className="sk-body">
              <div className="sk-left">
                <div className="skeleton-shimmer" style={{ width: '100%', height: '20px' }} />
                <div className="skeleton-shimmer" style={{ width: '100%', height: '32px' }} />
                <div className="skeleton-shimmer" style={{ width: '100%', height: '32px' }} />
                <div className="skeleton-shimmer" style={{ width: '100%', height: '32px' }} />
                <div style={{ marginTop: 'auto' }}>
                  <div className="skeleton-shimmer" style={{ width: '100%', height: '80px' }} />
                </div>
              </div>
              <div className="sk-right">
                <div className="skeleton-shimmer" style={{ width: '30%', height: '24px' }} />
                <div className="skeleton-shimmer" style={{ width: '100%', height: '220px' }} />
              </div>
            </div>
          </div>
        </StyledWrapper>
      </Modal>
    );
  }

  // -------------------------------------------------------------
  // Render: Uninitialized Repository View
  // -------------------------------------------------------------
  if (!isRepoInitialized) {
    return (
      <Modal
        size="md"
        hideHeader={true}
        hideClose={true}
        handleCancel={onClose}
        hideFooter={true}
        noPadding={true}
        disableCloseOnOutsideClick={true}
      >
        <StyledWrapper style={{ height: 'auto', minHeight: 'auto' }}>
          <div className="git-header-bar">
            <div className="git-header-left">
              <div className="git-branding-badge">
                <span className="cat-brand-avatar">🐱</span>
                <div className="cat-brand-info">
                  <span className="cat-brand-title">NgaRing</span>
                  <span className="cat-brand-sub">Git Studio</span>
                </div>
              </div>
              <span className="git-repo-pill">
                <IconFolder size={15} className="repo-icon" />
                <span className="repo-title">{collection?.name || 'Collection'}</span>
              </span>
            </div>
            <div className="git-header-right">
              <button type="button" className="icon-btn-close" onClick={onClose} aria-label="Close dialog">
                <IconX size={18} />
              </button>
            </div>
          </div>
          <div className="git-tab-card-container" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div className="git-card" style={{ alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(234, 179, 8, 0.12)',
                  color: '#eab308',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem'
                }}
              >
                <IconBrandGit size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Initialize Git Version Control</h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'gray', maxWidth: '380px' }}>
                Track changes, review revisions, and sync your API collections with remote repositories like GitHub.
              </p>
              <div style={{ marginTop: '0.75rem' }}>
                <Button color="primary" onClick={handleInitRepo} loading={loading}>
                  Initialize Git Repository
                </Button>
              </div>
            </div>
          </div>
        </StyledWrapper>
      </Modal>
    );
  }

  // -------------------------------------------------------------
  // Render: Complete Polished Git Modal View
  // -------------------------------------------------------------
  return (
    <Modal
      size={isMaximized ? 'git is-maximized' : 'git'}
      hideHeader={true}
      hideClose={true}
      handleCancel={onClose}
      hideFooter={true}
      noPadding={true}
      disableCloseOnOutsideClick={true}
    >
      <StyledWrapper className={isMaximized ? 'is-maximized' : ''}>
        {/* Top Header Bar */}
        <div className="git-header-bar">
          <div className="git-header-left">
            <div className="git-branding-badge">
              <span className="cat-brand-avatar">🐱</span>
              <div className="cat-brand-info">
                <span className="cat-brand-title">NgaRing</span>
                <span className="cat-brand-sub">Git Studio</span>
              </div>
            </div>

            <div className="git-repo-pill" title={collection?.name}>
              <IconFolder size={15} className="repo-icon" />
              <span className="repo-title">{collection?.name}</span>
            </div>

            {/* Branch Switcher Dropdown */}
            <div className="git-branch-control" title={`Active Branch: ${gitStatus?.currentGitBranch || 'main'}`}>
              <IconGitBranch size={15} className="branch-icon" />
              {showNewBranchInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    className="git-styled-input"
                    style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem', width: '110px' }}
                    placeholder="branch-name"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateBranch();
                      if (e.key === 'Escape') setShowNewBranchInput(false);
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="new-branch-btn"
                    onClick={handleCreateBranch}
                    disabled={isBranchLoading || !newBranchName.trim()}
                  >
                    Save
                  </button>
                  <button type="button" className="new-branch-btn" onClick={() => setShowNewBranchInput(false)}>
                    <IconX size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <select
                    className="git-branch-select"
                    value={gitStatus?.currentGitBranch || 'main'}
                    onChange={(e) => handleBranchSwitch(e.target.value)}
                    disabled={isBranchLoading}
                  >
                    {(gitStatus?.branches || ['main']).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="new-branch-btn"
                    onClick={() => setShowNewBranchInput(true)}
                    title="Create new branch"
                  >
                    + Branch
                  </button>
                </>
              )}
            </div>

            {/* Ahead / Behind Commits Badge */}
            {(aheadCount > 0 || behindCount > 0) && (
              <div className="git-ahead-behind-badge">
                {aheadCount > 0 && (
                  <span className="ahead-item" title={`${aheadCount} commit(s) ahead of origin`}>
                    <IconArrowUp size={12} />
                    {aheadCount}
                  </span>
                )}
                {behindCount > 0 && (
                  <span className="behind-item" title={`${behindCount} commit(s) behind origin`}>
                    <IconArrowDown size={12} />
                    {behindCount}
                  </span>
                )}
              </div>
            )}

            {/* Background Revalidation Indicator */}
            {isRefreshingStatus && (
              <div className="syncing-indicator" title="Synchronizing status in background...">
                <span className="sync-dot" />
                <span>Syncing</span>
              </div>
            )}
          </div>

          {/* Center: Segmented Navigation Tabs */}
          <div className="git-header-center">
            <div className="git-nav-tabs" role="tablist">
              <button
                type="button"
                className={`git-tab-item ${activeTab === 'changes' ? 'active' : ''}`}
                onClick={() => handleTabChange('changes')}
              >
                <IconGitPullRequest size={14} />
                <span>Changes</span>
                {totalChangesCount > 0 && <span className="tab-badge">{totalChangesCount}</span>}
              </button>

              <button
                type="button"
                className={`git-tab-item ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => handleTabChange('history')}
              >
                <IconGitCommit size={14} />
                <span>History</span>
              </button>

              <button
                type="button"
                className={`git-tab-item ${activeTab === 'stash' ? 'active' : ''}`}
                onClick={() => handleTabChange('stash')}
              >
                <IconArchive size={14} />
                <span>Stashes</span>
                {stashes.length > 0 && <span className="tab-badge">{stashes.length}</span>}
              </button>

              <button
                type="button"
                className={`git-tab-item ${activeTab === 'github' ? 'active' : ''}`}
                onClick={() => handleTabChange('github')}
              >
                <IconBrandGithub size={14} />
                <span>Remotes</span>
                {githubAuth && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      display: 'inline-block'
                    }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="git-header-right">
            <div className="git-action-group">
              <button
                type="button"
                className="git-sync-btn"
                onClick={handleFetch}
                disabled={isFetching || isPushing || isPulling}
                title="Fetch updates from remote repository"
              >
                <IconCloudDownload size={14} />
                <span>Fetch</span>
              </button>

              <button
                type="button"
                className={`git-sync-btn ${behindCount > 0 ? 'accent-highlight' : ''}`}
                onClick={handlePull}
                disabled={isPulling || isPushing || isFetching}
                title="Pull and merge incoming commits"
              >
                <IconArrowDown size={14} />
                <span>Pull {behindCount > 0 ? `(${behindCount})` : ''}</span>
              </button>

              <button
                type="button"
                className={`git-sync-btn ${aheadCount > 0 ? 'accent-highlight' : ''}`}
                onClick={handlePush}
                disabled={isPushing || isPulling || isFetching}
                title="Push outgoing commits to remote"
              >
                <IconArrowUp size={14} />
                <span>Push {aheadCount > 0 ? `(${aheadCount})` : ''}</span>
              </button>

              <button
                type="button"
                className={`icon-btn-refresh ${isRefreshingStatus ? 'is-spinning' : ''}`}
                onClick={() => fetchStatus(true)}
                title="Refresh Git status"
                aria-label="Refresh Git status"
              >
                <IconRefresh size={14} />
              </button>

              <button
                type="button"
                className="icon-btn-maximize"
                onClick={() => setIsMaximized((prev) => !prev)}
                title={isMaximized ? 'Restore dialog' : 'Maximize to fullscreen'}
                aria-label={isMaximized ? 'Restore dialog' : 'Maximize to fullscreen'}
              >
                {isMaximized ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
              </button>

              <button type="button" className="icon-btn-close" onClick={onClose} aria-label="Close Git modal">
                <IconX size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Warning & Conflict Banners */}
        {errorBanner && (
          <div className="git-banner error">
            <div className="flex items-center gap-1.5">
              <IconAlertCircle size={14} />
              <span>{errorBanner}</span>
            </div>
            <button type="button" className="git-small-action-btn" onClick={() => setErrorBanner(null)}>
              Dismiss
            </button>
          </div>
        )}

        {gitStatus?.conflicted && gitStatus.conflicted.length > 0 && (
          <div className="git-banner conflict">
            <div className="flex items-center gap-1.5">
              <IconAlertCircle size={15} />
              <span>
                <strong>Merge Conflict:</strong> {gitStatus.conflicted.length} conflicting file(s) require resolution.
              </span>
            </div>
            <button type="button" className="git-small-action-btn danger" onClick={handleAbortMerge}>
              Abort Merge
            </button>
          </div>
        )}

        {/* TAB 1: CHANGES VIEW */}
        {activeTab === 'changes' && (
          <div className="git-main-layout">
            {/* Left Files & Commit Panel */}
            <div className="git-files-panel">
              <div className="git-panel-header">
                <span className="panel-title">Changes ({totalChangesCount})</span>
                <div className="panel-actions">
                  {gitStatus?.unstaged?.length > 0 && (
                    <button
                      type="button"
                      className="git-small-action-btn accent"
                      onClick={handleStageAll}
                      title="Stage all unstaged changes"
                    >
                      <IconPlus size={12} />
                      <span>Stage All</span>
                    </button>
                  )}
                  {gitStatus?.staged?.length > 0 && (
                    <button
                      type="button"
                      className="git-small-action-btn"
                      onClick={handleUnstageAll}
                      title="Unstage all staged files"
                    >
                      <IconMinus size={12} />
                      <span>Unstage All</span>
                    </button>
                  )}
                  {gitStatus?.unstaged?.length > 0 && (
                    <button
                      type="button"
                      className="git-small-action-btn danger"
                      onClick={handleDiscardAll}
                      title="Discard all unstaged files"
                    >
                      <IconTrash size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Search file filter */}
              <div className="git-file-search">
                <IconSearch size={13} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter changed files..."
                  value={fileSearchQuery}
                  onChange={(e) => setFileSearchQuery(e.target.value)}
                />
                {fileSearchQuery && (
                  <button type="button" className="clear-search-btn" onClick={() => setFileSearchQuery('')}>
                    <IconX size={12} />
                  </button>
                )}
              </div>

              {/* Scrollable file groups */}
              <div className="git-scroll-files">
                {/* Conflicted Files Group */}
                {filteredConflicted.length > 0 && (
                  <>
                    <div className="git-group-header group-conflict">
                      <span>Conflicted ({filteredConflicted.length})</span>
                    </div>
                    {filteredConflicted.map((file) => {
                      const { dir, name } = formatFilePath(file.path);
                      const isSelected = selectedFile?.path === file.path;
                      return (
                        <div
                          key={file.path}
                          className={`git-file-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectFile({ ...file, type: 'unstaged' })}
                        >
                          <div className="file-item-main">
                            <span className="git-badge status-u">U</span>
                            <div className="file-path-text" title={file.path}>
                              {dir && <span className="dir-prefix">{dir}</span>}
                              <span className="file-name" style={{ color: '#ef4444' }}>
                                {name}
                              </span>
                            </div>
                          </div>
                          <div className="file-hover-actions">
                            <button
                              type="button"
                              className="stage-btn"
                              onClick={(e) => handleStage(file, e)}
                              title="Mark resolved (Stage)"
                            >
                              <IconPlus size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Staged Changes Group */}
                {filteredStaged.length > 0 && (
                  <>
                    <div className="git-group-header group-staged">
                      <span>Staged Changes ({filteredStaged.length})</span>
                      <button
                        type="button"
                        className="git-small-action-btn"
                        onClick={handleUnstageAll}
                        title="Unstage all"
                      >
                        Unstage All
                      </button>
                    </div>
                    {filteredStaged.map((file) => {
                      const { dir, name } = formatFilePath(file.path);
                      const isSelected = selectedFile?.path === file.path && selectedFile?.type === 'staged';
                      return (
                        <div
                          key={file.path}
                          className={`git-file-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectFile({ ...file, type: 'staged' })}
                        >
                          <div className="file-item-main">
                            <span className={`git-badge status-${(file.fileIndex || 'm').toLowerCase()}`}>
                              {file.fileIndex || 'M'}
                            </span>
                            <div className="file-path-text" title={file.path}>
                              {dir && <span className="dir-prefix">{dir}</span>}
                              <span className="file-name">{name}</span>
                            </div>
                          </div>
                          <div className="file-hover-actions">
                            <button
                              type="button"
                              className="unstage-btn"
                              onClick={(e) => handleUnstage(file, e)}
                              title="Unstage change"
                            >
                              <IconMinus size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Unstaged Changes Group */}
                <div className="git-group-header">
                  <span>Changes ({filteredUnstaged.length})</span>
                  {filteredUnstaged.length > 0 && (
                    <button
                      type="button"
                      className="git-small-action-btn accent"
                      onClick={handleStageAll}
                      title="Stage all"
                    >
                      Stage All
                    </button>
                  )}
                </div>

                {filteredUnstaged.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'gray', fontSize: '0.75rem' }}>
                    {filteredStaged.length > 0
                      ? 'All changes staged'
                      : fileSearchQuery
                      ? 'No matching files found'
                      : 'Working directory clean'}
                  </div>
                ) : (
                  filteredUnstaged.map((file) => {
                    const { dir, name } = formatFilePath(file.path);
                    const isSelected = selectedFile?.path === file.path && selectedFile?.type === 'unstaged';
                    return (
                      <div
                        key={file.path}
                        className={`git-file-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectFile({ ...file, type: 'unstaged' })}
                      >
                        <div className="file-item-main">
                          <span className={`git-badge status-${(file.working_dir || 'm').toLowerCase()}`}>
                            {file.working_dir || 'M'}
                          </span>
                          <div className="file-path-text" title={file.path}>
                            {dir && <span className="dir-prefix">{dir}</span>}
                            <span className="file-name">{name}</span>
                          </div>
                        </div>
                        <div className="file-hover-actions">
                          <button
                            type="button"
                            className="stage-btn"
                            onClick={(e) => handleStage(file, e)}
                            title="Stage change"
                          >
                            <IconPlus size={13} />
                          </button>
                          <button
                            type="button"
                            className="discard-btn"
                            onClick={(e) => handleDiscard(file, e)}
                            title="Discard changes"
                          >
                            <IconRotate2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Commit Composer */}
              <div className="git-commit-composer">
                <div className="conventional-chips">
                  {['feat', 'fix', 'docs', 'chore', 'refactor'].map((type) => (
                    <button key={type} type="button" onClick={() => handleInsertPrefix(type)}>
                      {type}
                    </button>
                  ))}
                </div>
                <textarea
                  className="commit-textarea"
                  rows={3}
                  placeholder="Commit message (e.g. feat: add assertion)..."
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleCommit();
                    }
                  }}
                />
                <div className="commit-footer">
                  <span
                    className={`shortcut-hint ${
                      commitMessage.length > 72 ? 'danger' : commitMessage.length > 50 ? 'warn' : ''
                    }`}
                  >
                    {commitMessage.length > 0 ? `${commitMessage.length}/72 chars` : 'Ctrl + Enter to commit'}
                  </span>
                  <button
                    type="button"
                    className="commit-submit-btn"
                    onClick={handleCommit}
                    disabled={isCommitting || !commitMessage.trim() || !gitStatus?.staged?.length}
                  >
                    <IconGitCommit size={14} />
                    <span>
                      {isCommitting
                        ? 'Committing...'
                        : `Commit ${gitStatus?.staged?.length ? `(${gitStatus.staged.length})` : ''}`}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Diff Viewer Pane */}
            <div className="git-diff-pane">
              {selectedFile ? (
                <>
                  <div className="git-diff-header">
                    <div className="diff-file-info" title={selectedFile.path}>
                      <span className={`git-badge status-${(selectedFile.fileIndex || selectedFile.working_dir || 'm').toLowerCase()}`}>
                        {selectedFile.fileIndex || selectedFile.working_dir || 'M'}
                      </span>
                      <span>{selectedFile.path}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'gray', fontWeight: 'normal' }}>
                        ({selectedFile.type === 'staged' ? 'Staged' : 'Working Tree'})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {(diffStats.additions > 0 || diffStats.deletions > 0) && (
                        <div className="diff-stats-badge">
                          {diffStats.additions > 0 && <span className="stat-add">+{diffStats.additions}</span>}
                          {diffStats.deletions > 0 && <span className="stat-del">-{diffStats.deletions}</span>}
                        </div>
                      )}

                      <div className="diff-actions">
                        <button
                          type="button"
                          className={`copy-diff-btn ${isCopiedDiff ? 'copied' : ''}`}
                          onClick={handleCopyDiff}
                          title="Copy diff to clipboard"
                        >
                          {isCopiedDiff ? <IconCheck size={12} /> : <IconCopy size={12} />}
                          <span>{isCopiedDiff ? 'Copied' : 'Copy Diff'}</span>
                        </button>
                      </div>

                      <div className="diff-mode-switcher">
                        {isRequestFile(selectedFile.path) && (
                          <button
                            type="button"
                            className={diffViewMode === 'visual' ? 'active' : ''}
                            onClick={() => handleToggleDiffMode('visual')}
                          >
                            <IconLayoutColumns size={12} />
                            <span>Visual Diff</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className={diffViewMode === 'raw' ? 'active' : ''}
                          onClick={() => handleToggleDiffMode('raw')}
                        >
                          <IconCode size={12} />
                          <span>Code Diff</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="git-diff-content-area">
                    {diffLoading ? (
                      <div className="git-diff-empty">
                        <IconRefresh size={24} className="is-spinning" />
                        <p>Computing differences...</p>
                      </div>
                    ) : diffViewMode === 'visual' && visualDiffData ? (
                      <VisualDiffViewer
                        oldData={visualDiffData.oldData}
                        newData={visualDiffData.newData}
                        oldLabel={visualDiffData.oldLabel || 'HEAD'}
                        newLabel={visualDiffData.newLabel || 'Working Tree'}
                      />
                    ) : (
                      <div className="raw-diff-container">
                        {fileDiff.split('\n').map((line, idx) => {
                          let lineType = 'normal';
                          if (line.startsWith('+') && !line.startsWith('+++')) lineType = 'addition';
                          else if (line.startsWith('-') && !line.startsWith('---')) lineType = 'deletion';
                          else if (line.startsWith('@@')) lineType = 'header';
                          return (
                            <div key={idx} className={`diff-line diff-${lineType}`}>
                              {line || ' '}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="git-diff-empty">
                  <div className="cat-mascot-box">
                    <div className="cat-ascii">
                      {` /\\_/\\ `}<br />
                      {`( ^.^ )`}<br />
                      {` > ^ < `}
                    </div>
                    <div className="cat-title">NgaRing Git Studio</div>
                    <div className="cat-subtitle">
                      {totalChangesCount > 0
                        ? `${totalChangesCount} file(s) changed. Select a file on the left to inspect differences.`
                        : 'Working tree clean. All changes are committed.'}
                    </div>
                  </div>

                  <div className="shortcuts-card">
                    <div className="shortcut-item">
                      <span>Commit Changes</span>
                      <span className="key-badge">Ctrl + ↵</span>
                    </div>
                    <div className="shortcut-item">
                      <span>Filter Files</span>
                      <span className="key-badge">Ctrl + F</span>
                    </div>
                    <div className="shortcut-item">
                      <span>Refresh Status</span>
                      <span className="key-badge">Ctrl + R</span>
                    </div>
                    <div className="shortcut-item">
                      <span>Close Studio</span>
                      <span className="key-badge">Esc</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY VIEW */}
        {activeTab === 'history' && (
          <div className="git-history-layout">
            {/* Left Commit History List */}
            <div className="history-list-pane">
              <div className="git-panel-header">
                <span className="panel-title">Commit Log ({historyLogs.length})</span>
                <button
                  type="button"
                  className="git-small-action-btn"
                  onClick={() => loadHistoryLogs()}
                  title="Reload commit log"
                >
                  <IconRefresh size={12} className={historyLoading ? 'is-spinning' : ''} />
                </button>
              </div>

              {/* Search commits bar */}
              <div style={{ padding: '0.5rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <IconSearch size={14} style={{ position: 'absolute', left: '8px', color: 'gray' }} />
                  <input
                    type="text"
                    className="git-styled-input"
                    style={{ paddingLeft: '28px', fontSize: '0.75rem' }}
                    placeholder="Filter commits by message or hash..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Commits scroll list */}
              <div className="git-scroll-files">
                {historyLoading && historyLogs.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'gray', fontSize: '0.75rem' }}>
                    Loading commit history...
                  </div>
                ) : filteredHistoryLogs.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'gray', fontSize: '0.75rem' }}>
                    No commits match your filter
                  </div>
                ) : (
                  filteredHistoryLogs.map((commit) => {
                    const isSelected = selectedCommit?.hash === commit.hash;
                    return (
                      <div
                        key={commit.hash}
                        className={`history-commit-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectCommit(commit)}
                      >
                        <div className="commit-message-title" title={commit.message}>
                          {commit.message}
                        </div>
                        <div className="commit-meta">
                          <span className="truncate max-w-[140px]">{commit.author_name}</span>
                          <span className="commit-hash-pill">
                            {commit.hash ? commit.hash.substring(0, 7) : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Commit Detail Pane */}
            <div className="history-detail-pane">
              {selectedCommit ? (
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="git-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>{selectedCommit.message}</h3>
                        <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'gray' }}>
                          By <strong>{selectedCommit.author_name}</strong> &lt;{selectedCommit.author_email}&gt; on{' '}
                          {new Date(selectedCommit.date).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className="commit-hash-pill"
                        style={{ fontFamily: 'monospace', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      >
                        {selectedCommit.hash.substring(0, 10)}
                      </span>
                    </div>
                  </div>

                  {/* Modified Files in Commit */}
                  <div className="git-card">
                    <div className="card-title">
                      <IconGitPullRequest size={16} />
                      <span>Changed Files ({commitFiles.length})</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {commitFiles.map((file) => (
                        <div
                          key={file.path}
                          className={`git-file-item ${selectedCommitFile?.path === file.path ? 'selected' : ''}`}
                          style={{ borderRadius: '4px' }}
                          onClick={() => handleSelectCommitFile(selectedCommit.hash, file)}
                        >
                          <div className="file-item-main">
                            <span className="git-badge status-m">M</span>
                            <span style={{ fontSize: '0.75rem' }}>{file.path}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diff Viewer for selected commit file */}
                  {selectedCommitFile && (
                    <div className="git-card" style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Diff for {selectedCommitFile.path}
                      </div>
                      <div className="raw-diff-container" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                        {commitDiffLoading ? (
                          <div style={{ padding: '1rem', textAlign: 'center', color: 'gray' }}>Loading diff...</div>
                        ) : (
                          commitFileDiff.split('\n').map((line, idx) => {
                            let lineType = 'normal';
                            if (line.startsWith('+') && !line.startsWith('+++')) lineType = 'addition';
                            else if (line.startsWith('-') && !line.startsWith('---')) lineType = 'deletion';
                            else if (line.startsWith('@@')) lineType = 'header';
                            return (
                              <div key={idx} className={`diff-line diff-${lineType}`}>
                                {line || ' '}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="git-diff-empty">
                  <h4>No Commit Selected</h4>
                  <p>Choose a commit on the left to inspect its details and file changes.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STASHES VIEW */}
        {activeTab === 'stash' && (
          <div className="git-tab-card-container">
            {/* Create Stash Card */}
            <div className="git-card">
              <div className="card-title">
                <IconArchive size={16} />
                <span>Stash Working Directory</span>
              </div>
              <div className="card-description">
                Save your uncommitted modifications to the stash so you can switch branches or pull safely.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="git-styled-input"
                  placeholder="Optional stash description (e.g. Work in progress on login flow)..."
                  value={stashMessageInput}
                  onChange={(e) => setStashMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateStash();
                  }}
                />
                <Button color="primary" size="sm" onClick={handleCreateStash} loading={isStashing}>
                  Stash Changes
                </Button>
              </div>
            </div>

            {/* Stashes List */}
            <div className="git-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title">
                  <span>Saved Stashes ({stashes.length})</span>
                </div>
                <button type="button" className="git-small-action-btn" onClick={loadStashes} title="Refresh stashes">
                  <IconRefresh size={12} className={stashesLoading ? 'is-spinning' : ''} />
                </button>
              </div>

              {stashes.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'gray', fontSize: '0.8125rem' }}>
                  No stashes saved for this repository.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {stashes.map((stash, idx) => (
                    <div
                      key={stash.index || idx}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{stash.message}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'gray', marginTop: '0.2rem' }}>
                          stash@&#123;{stash.index}&#125; &bull; {stash.date || 'Recent'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Button size="sm" variant="outline" onClick={() => handleApplyStash(stash.index)}>
                          Apply
                        </Button>
                        <Button size="sm" variant="outline" color="danger" onClick={() => handleDropStash(stash.index)}>
                          Drop
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: REMOTES & GITHUB VIEW */}
        {activeTab === 'github' && (
          <div className="git-tab-card-container">
            {/* Remote Origin Card */}
            <div className="git-card">
              <div className="card-title">
                <IconBrandGit size={16} />
                <span>Remote Repository Configuration</span>
              </div>
              <div className="card-description">
                Configure your upstream repository URL to push commits and pull updates.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="git-styled-input"
                  placeholder="https://github.com/username/repository.git"
                  value={remoteUrlInput}
                  onChange={(e) => setRemoteUrlInput(e.target.value)}
                />
                <Button color="primary" size="sm" onClick={handleSaveRemote} loading={isSavingRemote}>
                  Save Remote
                </Button>
              </div>
            </div>

            {/* GitHub Account Integration */}
            <div className="git-card">
              <div className="card-title">
                <IconBrandGithub size={16} />
                <span>GitHub Authentication</span>
              </div>
              <div className="card-description">
                Link your GitHub account using a Personal Access Token to authenticate HTTPS pushes without repetitive password prompts.
              </div>

              {githubAuth ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    backgroundColor: 'rgba(34, 197, 94, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={githubAuth.user.avatar_url}
                      alt={githubAuth.user.login}
                      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {githubAuth.user.name || githubAuth.user.login}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'gray' }}>
                        @{githubAuth.user.login} &bull; {githubAuth.user.email || 'GitHub User'}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" color="danger" onClick={handleLogoutGithub}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type={showTokenText ? 'text' : 'password'}
                        className="git-styled-input"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={githubTokenInput}
                        onChange={(e) => setGithubTokenInput(e.target.value)}
                      />
                      <button
                        type="button"
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: 'gray',
                          cursor: 'pointer'
                        }}
                        onClick={() => setShowTokenText((prev) => !prev)}
                      >
                        {showTokenText ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={handleVerifyAndSaveGithub}
                      loading={isVerifyingGithub}
                      disabled={!githubTokenInput.trim()}
                    >
                      Connect Account
                    </Button>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'gray' }}>
                    Need a token?{' '}
                    <a
                      href={GITHUB_TOKEN_CREATE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#eab308', textDecoration: 'underline' }}
                    >
                      Generate a personal access token on GitHub
                    </a>{' '}
                    with <code>repo</code> scope.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </StyledWrapper>
    </Modal>
  );
};

export default GitSyncModal;
