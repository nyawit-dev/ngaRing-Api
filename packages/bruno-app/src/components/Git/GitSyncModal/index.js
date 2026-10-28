import React, { useState, useEffect, useCallback } from 'react';
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
  IconFileText,
  IconCheck,
  IconX,
  IconExternalLink,
  IconCopy,
  IconLock,
  IconLink,
  IconEye,
  IconEyeOff,
  IconArrowLeft,
  IconCloudDownload,
  IconArchive,
  IconChevronDown,
  IconChevronRight,
  IconCode,
  IconLayoutColumns
} from '@tabler/icons';
import {
  getGitStatus,
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

const GITHUB_TOKEN_CREATE_URL = 'https://github.com/settings/tokens/new?scopes=repo&description=Bruno%20Git%20Client';

const GitSyncModal = ({ collection, onClose }) => {
  const [activeTab, setActiveTab] = useState('changes');
  const [loading, setLoading] = useState(true);
  const [gitStatus, setGitStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mobileActivePane, setMobileActivePane] = useState('files');
  const [diffViewMode, setDiffViewMode] = useState('raw'); // 'raw' or 'visual'
  const [fileDiff, setFileDiff] = useState('');
  const [visualDiffData, setVisualDiffData] = useState(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isBranchLoading, setIsBranchLoading] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [showNewBranchInput, setShowNewBranchInput] = useState(false);
  const [showBranchDeleteModal, setShowBranchDeleteModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState('');
  const [remoteUrlInput, setRemoteUrlInput] = useState('');
  const [isSavingRemote, setIsSavingRemote] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  // Stash state
  const [stashes, setStashes] = useState([]);
  const [stashesLoading, setStashesLoading] = useState(false);
  const [stashMessageInput, setStashMessageInput] = useState('');
  const [isStashing, setIsStashing] = useState(false);
  const [activeStashIndex, setActiveStashIndex] = useState(null);
  const [stashFiles, setStashFiles] = useState([]);
  const [selectedStashFile, setSelectedStashFile] = useState(null);
  const [stashDiffText, setStashDiffText] = useState('');
  const [stashDiffLoading, setStashDiffLoading] = useState(false);

  // History state
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedCommitHash, setExpandedCommitHash] = useState(null);
  const [commitFilesMap, setCommitFilesMap] = useState({});
  const [selectedCommitFile, setSelectedCommitFile] = useState(null);
  const [commitFileDiff, setCommitFileDiff] = useState('');
  const [commitDiffLoading, setCommitDiffLoading] = useState(false);

  // GitHub Auth State
  const [githubAuth, setGithubAuth] = useState(null);
  const [githubTokenInput, setGithubTokenInput] = useState('');
  const [showTokenText, setShowTokenText] = useState(false);
  const [isVerifyingGithub, setIsVerifyingGithub] = useState(false);

  const isRequestFile = (filePath) => {
    if (!filePath) return false;
    return filePath.endsWith('.bru') || filePath.endsWith('.yml');
  };

  const fetchStatus = useCallback(async (keepSelection = true) => {
    if (!collection?.pathname) return;
    try {
      setLoading((prev) => (gitStatus ? prev : true));
      setErrorBanner(null);
      const [status, ghAuth] = await Promise.all([
        getGitStatus(collection.pathname),
        getGitHubAuth().catch(() => null)
      ]);
      setGitStatus(status);
      setGithubAuth(ghAuth);
      if (status?.logs) {
        setHistoryLogs(status.logs);
      }
      if (status?.gitRepoUrl) {
        setRemoteUrlInput(status.gitRepoUrl);
      }
    } catch (err) {
      console.error('Failed to load git status:', err);
      setErrorBanner(err.message || 'Failed to load git repository status');
    } finally {
      setLoading(false);
    }
  }, [collection?.pathname, gitStatus]);

  useEffect(() => {
    fetchStatus();
  }, [collection?.pathname]);

  const loadDiff = useCallback(async (file, rootPath, mode = diffViewMode) => {
    if (!file || !rootPath) return;
    try {
      setDiffLoading(true);

      if (mode === 'visual' && isRequestFile(file.path)) {
        const visualResult = await getGitVisualDiff(rootPath, file.path, file.type || 'unstaged');
        setVisualDiffData(visualResult);
      } else {
        const diff = await getGitDiff(rootPath, file.path, file.type === 'staged');
        setFileDiff(diff || 'No visible text differences found.');
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
    setMobileActivePane('diff');
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

  const handleInitRepo = async () => {
    try {
      setLoading(true);
      await initGitRepo(collection.pathname);
      toast.success('Git repository initialized successfully');
      await fetchStatus();
    } catch (err) {
      toast.error(`Failed to initialize git: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStage = async (file) => {
    try {
      await stageGitFiles(gitStatus.gitRootPath, [file.path]);
      await fetchStatus();
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
    if (!gitStatus?.unstaged?.length) return;
    try {
      const paths = gitStatus.unstaged.map((f) => f.path);
      await stageGitFiles(gitStatus.gitRootPath, paths);
      toast.success('All files staged');
      await fetchStatus();
      if (selectedFile) {
        const updated = { ...selectedFile, type: 'staged' };
        setSelectedFile(updated);
        loadDiff(updated, gitStatus.gitRootPath);
      }
    } catch (err) {
      toast.error(`Failed to stage all files: ${err.message}`);
    }
  };

  const handleUnstage = async (file) => {
    try {
      await unstageGitFiles(gitStatus.gitRootPath, [file.path]);
      await fetchStatus();
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
    if (!gitStatus?.staged?.length) return;
    try {
      const paths = gitStatus.staged.map((f) => f.path);
      await unstageGitFiles(gitStatus.gitRootPath, paths);
      toast.success('All files unstaged');
      await fetchStatus();
      if (selectedFile) {
        const updated = { ...selectedFile, type: 'unstaged' };
        setSelectedFile(updated);
        loadDiff(updated, gitStatus.gitRootPath);
      }
    } catch (err) {
      toast.error(`Failed to unstage files: ${err.message}`);
    }
  };

  const handleDiscard = async (file) => {
    const confirmed = window.confirm(`Are you sure you want to discard changes in ${file.path}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await discardGitFiles(gitStatus.gitRootPath, [file.path]);
      toast.success(`Discarded changes in ${file.path}`);
      if (selectedFile?.path === file.path) {
        setSelectedFile(null);
        setFileDiff('');
        setVisualDiffData(null);
      }
      await fetchStatus();
    } catch (err) {
      toast.error(`Failed to discard changes: ${err.message}`);
    }
  };

  const handleDiscardAll = async () => {
    if (!gitStatus?.unstaged?.length) return;
    const count = gitStatus.unstaged.length;
    const confirmed = window.confirm(
      `Are you sure you want to discard ALL ${count} unstaged changes? All uncommitted edits and untracked changes will be lost permanently.`
    );
    if (!confirmed) return;

    try {
      const paths = gitStatus.unstaged.map((f) => f.path);
      await discardGitFiles(gitStatus.gitRootPath, paths);
      toast.success(`Discarded all ${count} changes`);
      setSelectedFile(null);
      setFileDiff('');
      setVisualDiffData(null);
      await fetchStatus();
    } catch (err) {
      toast.error(`Failed to discard all changes: ${err.message}`);
    }
  };

  const checkStagedSecrets = async () => {
    if (!gitStatus?.staged?.length) return [];
    const secretPatterns = [
      { name: 'GitHub Personal Access Token', regex: /gh[pousr]_[A-Za-z0-9_]{30,}/ },
      { name: 'API Key (OpenAI / Anthropic)', regex: /sk-[a-zA-Z0-9T3BlbkFJ_\-]{20,}/ },
      { name: 'AWS Access Key ID', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/ },
      { name: 'Private Key Header', regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/ },
      { name: 'Hardcoded Bearer Token', regex: /Bearer\s+[a-zA-Z0-9\-_\.]{40,}/i }
    ];

    const findings = [];
    for (const file of gitStatus.staged) {
      try {
        const diff = await getGitDiff(gitStatus.gitRootPath, file.path, true);
        if (!diff) continue;
        const lines = diff.split('\n');
        for (const line of lines) {
          if (line.startsWith('+') && !line.startsWith('+++')) {
            for (const pat of secretPatterns) {
              if (pat.regex.test(line) && !line.includes('{{')) {
                findings.push({ file: file.path, name: pat.name });
                break;
              }
            }
          }
        }
      } catch (e) {
        // non-blocking
      }
    }
    return findings;
  };

  const handleAbortMerge = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to abort the current merge? This will discard conflicting merge changes and restore your previous branch state.'
    );
    if (!confirmed) return;
    try {
      setLoading(true);
      await abortGitMerge(gitStatus.gitRootPath);
      toast.success('Merge aborted successfully');
      await fetchStatus();
    } catch (err) {
      toast.error(`Failed to abort merge: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      toast.error('Please enter a commit message');
      return;
    }
    if (!gitStatus?.staged?.length) {
      toast.error('No staged changes to commit');
      return;
    }

    try {
      setIsCommitting(true);

      // Secret Scanner Guard
      const secretFindings = await checkStagedSecrets();
      if (secretFindings.length > 0) {
        const fileNames = [...new Set(secretFindings.map((f) => f.file))].join(', ');
        const rules = [...new Set(secretFindings.map((f) => f.name))].join(', ');
        const proceed = window.confirm(
          `Security Alert: Potential raw secret/token detected in staged changes!\n\nFile(s): ${fileNames}\nPattern: ${rules}\n\nIt is strongly recommended to use environment variables {{SECRET}} instead of committing plaintext secrets.\n\nDo you still want to proceed with this commit?`
        );
        if (!proceed) {
          setIsCommitting(false);
          return;
        }
      }

      await commitGit(gitStatus.gitRootPath, commitMessage.trim());
      toast.success('Committed successfully');
      setCommitMessage('');
      setSelectedFile(null);
      setFileDiff('');
      setVisualDiffData(null);
      await fetchStatus();
      if (activeTab === 'history') {
        loadHistoryLogs();
      }
    } catch (err) {
      toast.error(`Commit failed: ${err.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  const hasConfiguredRemote = () => {
    return Boolean(gitStatus?.gitRepoUrl || (gitStatus?.remotes && gitStatus.remotes.length > 0));
  };

  const handleFetch = async () => {
    if (!hasConfiguredRemote()) {
      setActiveTab('github');
      toast.error('Remote URL (origin) has not been configured yet.');
      return;
    }
    try {
      setIsFetching(true);
      await fetchGit(gitStatus.gitRootPath, 'origin');
      toast.success('Fetched remote changes');
      await fetchStatus();
    } catch (err) {
      toast.error(`Fetch failed: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  const handlePush = async () => {
    if (!hasConfiguredRemote()) {
      setActiveTab('github');
      toast.error('Remote URL (origin) has not been configured yet.');
      return;
    }
    try {
      setIsPushing(true);
      await pushGit(gitStatus.gitRootPath, 'origin', gitStatus.currentGitBranch);
      toast.success('Pushed changes successfully');
      await fetchStatus();
    } catch (err) {
      toast.error(`Push failed: ${err.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  const handlePull = async () => {
    if (!hasConfiguredRemote()) {
      setActiveTab('github');
      toast.error('Remote URL (origin) has not been configured yet.');
      return;
    }
    try {
      setIsPulling(true);
      await pullGit(gitStatus.gitRootPath, 'origin', gitStatus.currentGitBranch, '--no-rebase');
      toast.success('Pulled changes successfully');
      await fetchStatus();
    } catch (err) {
      toast.error(`Pull failed: ${err.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  const handleBranchSwitch = async (branch) => {
    if (branch === gitStatus?.currentGitBranch) return;
    try {
      setIsBranchLoading(true);
      await checkoutGitBranch(gitStatus.gitRootPath, branch, false);
      toast.success(`Switched to branch '${branch}'`);
      setSelectedFile(null);
      setFileDiff('');
      setVisualDiffData(null);
      await fetchStatus();
    } catch (err) {
      toast.error(`Failed to switch branch: ${err.message}`);
    } finally {
      setIsBranchLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    const branchName = newBranchName.trim();
    if (!branchName) {
      toast.error('Branch name cannot be empty');
      return;
    }
    try {
      setIsBranchLoading(true);
      await checkoutGitBranch(gitStatus.gitRootPath, branchName, true);
      toast.success(`Created and checked out branch '${branchName}'`);
      setNewBranchName('');
      setShowNewBranchInput(false);
      setSelectedFile(null);
      setFileDiff('');
      setVisualDiffData(null);
      await fetchStatus();
    } catch (err) {
      toast.error(`Failed to create branch: ${err.message}`);
    } finally {
      setIsBranchLoading(false);
    }
  };

  const handleDeleteBranch = async (branch) => {
    if (!branch) return;
    if (branch === gitStatus?.currentGitBranch) {
      toast.error('Cannot delete the currently checked-out branch');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete branch '${branch}'?`);
    if (!confirmed) return;

    try {
      setIsBranchLoading(true);
      await deleteGitBranch(gitStatus.gitRootPath, branch);
      toast.success(`Deleted branch '${branch}'`);
      setShowBranchDeleteModal(false);
      await fetchStatus();
    } catch (err) {
      toast.error(`Failed to delete branch: ${err.message}`);
    } finally {
      setIsBranchLoading(false);
    }
  };

  const handleSaveRemote = async () => {
    const url = remoteUrlInput.trim();
    if (!url) {
      toast.error('Remote URL cannot be empty');
      return;
    }
    try {
      setIsSavingRemote(true);
      await addGitRemote(gitStatus.gitRootPath, url, 'origin');
      toast.success('Remote URL saved successfully');
      await fetchStatus();
    } catch (err) {
      toast.error(`Failed to save remote: ${err.message}`);
    } finally {
      setIsSavingRemote(false);
    }
  };

  // Stash Handlers
  const loadStashes = async () => {
    if (!gitStatus?.gitRootPath) return;
    try {
      setStashesLoading(true);
      const list = await listGitStashes(gitStatus.gitRootPath);
      setStashes(list || []);
    } catch (err) {
      console.error('Failed to load stashes:', err);
    } finally {
      setStashesLoading(false);
    }
  };

  const handleCreateStash = async () => {
    if (!gitStatus?.gitRootPath) return;
    const msg = stashMessageInput.trim() || `Bruno Stash on ${gitStatus.currentGitBranch || 'main'} (${new Date().toLocaleTimeString()})`;
    try {
      setIsStashing(true);
      await createGitStash(gitStatus.gitRootPath, msg);
      toast.success('Working changes stashed successfully');
      setStashMessageInput('');
      setSelectedFile(null);
      setFileDiff('');
      setVisualDiffData(null);
      await fetchStatus();
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
      toast.success(`Applied stash@{${index}}`);
      await fetchStatus();
      await loadStashes();
    } catch (err) {
      toast.error(`Failed to apply stash: ${err.message}`);
    }
  };

  const handleDropStash = async (index) => {
    if (!gitStatus?.gitRootPath) return;
    const confirmed = window.confirm(`Are you sure you want to drop stash@{${index}}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await dropGitStash(gitStatus.gitRootPath, index);
      toast.success(`Dropped stash@{${index}}`);
      if (activeStashIndex === index) {
        setActiveStashIndex(null);
        setStashFiles([]);
        setSelectedStashFile(null);
        setStashDiffText('');
      }
      await loadStashes();
    } catch (err) {
      toast.error(`Failed to drop stash: ${err.message}`);
    }
  };

  const handleToggleStashExpand = async (index) => {
    if (activeStashIndex === index) {
      setActiveStashIndex(null);
      setStashFiles([]);
      setSelectedStashFile(null);
      setStashDiffText('');
      return;
    }
    try {
      setActiveStashIndex(index);
      setSelectedStashFile(null);
      setStashDiffText('');
      const files = await getGitStashFiles(gitStatus.gitRootPath, index);
      setStashFiles(files || []);
    } catch (err) {
      toast.error(`Failed to read stash contents: ${err.message}`);
    }
  };

  const handleSelectStashFile = async (stashIdx, file) => {
    setSelectedStashFile(file);
    try {
      setStashDiffLoading(true);
      const diff = await getGitStashDiff(gitStatus.gitRootPath, stashIdx, file.path, file.isUntracked);
      setStashDiffText(diff || 'No diff content available.');
    } catch (err) {
      setStashDiffText(`Failed to load stash file diff: ${err.message}`);
    } finally {
      setStashDiffLoading(false);
    }
  };

  // History Handlers
  const loadHistoryLogs = async (limit = 50, skip = 0) => {
    if (!gitStatus?.gitRootPath) return;
    try {
      setHistoryLoading(true);
      const logs = await getGitLogs(gitStatus.gitRootPath, limit, skip);
      if (skip > 0) {
        setHistoryLogs((prev) => [...prev, ...logs]);
      } else {
        setHistoryLogs(logs || []);
      }
    } catch (err) {
      console.error('Failed to load history logs:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleToggleCommitExpand = async (commitHash) => {
    if (expandedCommitHash === commitHash) {
      setExpandedCommitHash(null);
      setSelectedCommitFile(null);
      setCommitFileDiff('');
      return;
    }
    setExpandedCommitHash(commitHash);
    setSelectedCommitFile(null);
    setCommitFileDiff('');

    if (!commitFilesMap[commitHash]) {
      try {
        const files = await getGitCommitFiles(gitStatus.gitRootPath, commitHash);
        setCommitFilesMap((prev) => ({ ...prev, [commitHash]: files || [] }));
      } catch (err) {
        toast.error(`Failed to get commit files: ${err.message}`);
      }
    }
  };

  const handleSelectCommitFile = async (commitHash, file) => {
    setSelectedCommitFile(file);
    try {
      setCommitDiffLoading(true);
      const diff = await getGitCommitFileDiff(gitStatus.gitRootPath, commitHash, file.path);
      setCommitFileDiff(diff || 'No diff found for this file.');
    } catch (err) {
      setCommitFileDiff(`Failed to load file diff: ${err.message}`);
    } finally {
      setCommitDiffLoading(false);
    }
  };

  // GitHub Auth Handlers
  const handleConnectGithub = async () => {
    const token = githubTokenInput.trim();
    if (!token) {
      toast.error('Please enter a GitHub Personal Access Token');
      return;
    }
    try {
      setIsVerifyingGithub(true);
      const authResult = await verifyGitHubToken(token);
      await saveGitHubAuth(authResult);
      setGithubAuth(authResult);
      setGithubTokenInput('');
      toast.success(`Connected to GitHub as @${authResult.user.login}`);
      await fetchStatus();
    } catch (err) {
      toast.error(err.message || 'Failed to authenticate with GitHub');
    } finally {
      setIsVerifyingGithub(false);
    }
  };

  const handleDisconnectGithub = async () => {
    const confirmed = window.confirm('Are you sure you want to disconnect your GitHub account?');
    if (!confirmed) return;
    try {
      await logoutGitHub();
      setGithubAuth(null);
      toast.success('GitHub account disconnected');
    } catch (err) {
      toast.error('Failed to disconnect GitHub account');
    }
  };

  const openExternalUrl = (url) => {
    if (window?.ipcRenderer?.openExternal) {
      window.ipcRenderer.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const getStatusBadge = (file) => {
    const code = file.fileIndex || file.working_dir || file.status || 'M';
    let label = 'M';
    let className = 'status-m';

    if (code === 'A' || code === '?' || code === 'added') {
      label = code === '?' ? '?' : 'A';
      className = 'status-a';
    } else if (code === 'D' || code === 'deleted') {
      label = 'D';
      className = 'status-d';
    } else if (code === 'U' || code === 'conflicted') {
      label = 'U';
      className = 'status-u';
    }

    return <span className={`git-status-badge ${className}`}>{label}</span>;
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

  // Switch tab triggers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'history' && historyLogs.length === 0) {
      loadHistoryLogs();
    }
    if (tab === 'stash') {
      loadStashes();
    }
  };

  const isRepoInitialized = gitStatus?.isGit && gitStatus?.gitRootPath;
  const totalChangesCount = (gitStatus?.staged?.length || 0) + (gitStatus?.unstaged?.length || 0);

  return (
    <Modal
      size="xl"
      title={`Git: ${collection.name}`}
      handleCancel={onClose}
      hideFooter={true}
      noPadding={true}
    >
      <StyledWrapper>
        {loading ? (
          /* Polished High-Fidelity Skeleton Loader */
          <div className="git-skeleton-layout">
            <div className="skeleton-header-bar">
              <div className="flex items-center gap-2">
                <div className="skeleton-shimmer w-6 h-6 rounded" />
                <div className="skeleton-shimmer w-36 h-7 rounded" />
                <div className="skeleton-shimmer w-16 h-6 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="skeleton-shimmer w-20 h-7 rounded" />
                <div className="skeleton-shimmer w-20 h-7 rounded" />
                <div className="skeleton-shimmer w-20 h-7 rounded" />
              </div>
            </div>
            <div className="skeleton-body">
              <div className="skeleton-sidebar">
                <div className="skeleton-shimmer w-32 h-4 mb-2 rounded" />
                <div className="skeleton-shimmer w-full h-8 rounded" />
                <div className="skeleton-shimmer w-full h-8 rounded" />
                <div className="skeleton-shimmer w-full h-8 rounded" />
                <div className="skeleton-shimmer w-28 h-4 mt-4 mb-2 rounded" />
                <div className="skeleton-shimmer w-full h-8 rounded" />
                <div className="skeleton-shimmer w-full h-8 rounded" />
                <div className="mt-auto">
                  <div className="skeleton-shimmer w-full h-20 rounded" />
                  <div className="skeleton-shimmer w-full h-8 mt-2 rounded" />
                </div>
              </div>
              <div className="skeleton-diff">
                <div className="skeleton-shimmer w-48 h-6 rounded" />
                <div className="skeleton-shimmer w-full h-4 rounded" />
                <div className="skeleton-shimmer w-5/6 h-4 rounded" />
                <div className="skeleton-shimmer w-4/6 h-4 rounded" />
                <div className="skeleton-shimmer w-3/4 h-4 rounded" />
                <div className="skeleton-shimmer w-full h-4 rounded" />
                <div className="skeleton-shimmer w-2/3 h-4 rounded" />
              </div>
            </div>
          </div>
        ) : !isRepoInitialized ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <IconBrandGit size={52} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Git Repository Found</h3>
            <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
              This collection folder is not currently tracked by Git. You can initialize a new Git repository to begin tracking version history.
            </p>
            <Button color="primary" onClick={handleInitRepo}>
              Initialize Git Repository
            </Button>
          </div>
        ) : (
          <>
            {/* Top Toolbar */}
            <div className="git-header-bar">
              <div className="git-header-left">
                {/* Branch Switcher & Controls */}
                <div className="flex items-center gap-2 min-w-0">
                  <IconGitBranch size={16} className="text-yellow-500 flex-shrink-0" />
                  {showNewBranchInput ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <input
                        type="text"
                        className="git-input max-w-[130px]"
                        placeholder="new-branch"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateBranch();
                          if (e.key === 'Escape') setShowNewBranchInput(false);
                        }}
                        autoFocus
                      />
                      <Button size="sm" color="primary" onClick={handleCreateBranch} loading={isBranchLoading}>
                        Create
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNewBranchInput(false)}>
                        <IconX size={14} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <select
                        className="git-branch-select git-input font-medium cursor-pointer"
                        value={gitStatus.currentGitBranch || ''}
                        onChange={(e) => handleBranchSwitch(e.target.value)}
                        disabled={isBranchLoading}
                        title="Current active branch"
                      >
                        {(gitStatus.branches || []).map((branch) => (
                          <option key={branch} value={branch}>
                            {branch}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="text-xs text-yellow-500 hover:text-yellow-400 cursor-pointer font-medium px-1 flex-shrink-0"
                        onClick={() => setShowNewBranchInput(true)}
                        title="Create new branch"
                      >
                        + New
                      </button>

                      {/* Delete Branch action button if other branches exist */}
                      {(gitStatus.branches || []).filter((b) => b !== gitStatus.currentGitBranch && b !== 'main' && b !== 'master').length > 0 && (
                        <button
                          type="button"
                          className="text-xs text-gray-400 hover:text-rose-400 cursor-pointer px-1 flex-shrink-0"
                          onClick={() => {
                            const candidates = (gitStatus.branches || []).filter((b) => b !== gitStatus.currentGitBranch && b !== 'main' && b !== 'master');
                            const target = window.prompt(`Enter branch name to delete:\nAvailable: ${candidates.join(', ')}`);
                            if (target && candidates.includes(target.trim())) {
                              handleDeleteBranch(target.trim());
                            } else if (target) {
                              toast.error('Branch not found or currently active');
                            }
                          }}
                          title="Delete a branch"
                        >
                          <IconTrash size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Ahead / Behind Pills */}
                {gitStatus.aheadBehind && (
                  <div className="git-ahead-behind-pill">
                    <span className="flex items-center text-emerald-400 font-medium" title="Commits ahead of remote">
                      <IconArrowUp size={13} className="mr-0.5" />
                      {gitStatus.aheadBehind.ahead || 0}
                    </span>
                    <span className="flex items-center text-rose-400 font-medium" title="Commits behind remote">
                      <IconArrowDown size={13} className="mr-0.5" />
                      {gitStatus.aheadBehind.behind || 0}
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="git-tabs">
                <button
                  type="button"
                  className={`git-tab-btn ${activeTab === 'changes' ? 'active' : ''}`}
                  onClick={() => handleTabChange('changes')}
                >
                  <IconGitPullRequest size={14} />
                  <span>Changes</span>
                  {totalChangesCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-yellow-500/20 text-yellow-400 rounded-full text-[10px] font-bold">
                      {totalChangesCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={`git-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => handleTabChange('history')}
                >
                  <IconGitCommit size={14} />
                  <span>History</span>
                  <span className="text-[10px] text-gray-400">({historyLogs?.length || gitStatus.logs?.length || 0})</span>
                </button>
                <button
                  type="button"
                  className={`git-tab-btn ${activeTab === 'stash' ? 'active' : ''}`}
                  onClick={() => handleTabChange('stash')}
                >
                  <IconArchive size={14} />
                  <span>Stash</span>
                  {stashes.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-purple-500/20 text-purple-400 rounded-full text-[10px] font-bold">
                      {stashes.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={`git-tab-btn ${activeTab === 'github' ? 'active' : ''}`}
                  onClick={() => handleTabChange('github')}
                >
                  <IconBrandGithub size={14} />
                  <span>GitHub</span>
                  {githubAuth ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
                  ) : (
                    <span className="text-[10px] text-yellow-500 font-medium ml-0.5">Connect</span>
                  )}
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="git-header-right">
                <div className="flex items-center gap-2 flex-wrap">
                  {githubAuth ? (
                    <div
                      className="git-user-badge truncate"
                      onClick={() => handleTabChange('github')}
                      title={`Logged in as @${githubAuth.user.login} (${githubAuth.user.name})`}
                    >
                      <img
                        src={githubAuth.user.avatar_url}
                        alt={githubAuth.user.login}
                        className="w-4 h-4 rounded-full flex-shrink-0"
                      />
                      <span className="text-xs font-medium truncate">@{githubAuth.user.login}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      color="secondary"
                      onClick={() => handleTabChange('github')}
                      className="text-xs"
                    >
                      <IconBrandGithub size={14} className="mr-1.5 flex-shrink-0" />
                      <span>Login</span>
                    </Button>
                  )}

                  {/* Git Fetch Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    color="secondary"
                    onClick={handleFetch}
                    loading={isFetching}
                    disabled={isPushing || isPulling}
                    title="Fetch changes from remote without merging"
                  >
                    <IconCloudDownload size={14} className="mr-1" /> Fetch
                  </Button>

                  {/* Git Pull Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    color="secondary"
                    onClick={handlePull}
                    loading={isPulling}
                    disabled={isPushing || isFetching}
                    title="Pull changes from remote"
                  >
                    <IconArrowDown size={14} className="mr-1" /> Pull
                  </Button>

                  {/* Git Push Button */}
                  <Button
                    size="sm"
                    color={gitStatus?.aheadBehind?.ahead > 0 ? 'primary' : 'secondary'}
                    variant={gitStatus?.aheadBehind?.ahead > 0 ? 'filled' : 'outline'}
                    onClick={handlePush}
                    loading={isPushing}
                    disabled={isPulling || isFetching}
                    title="Push changes to remote"
                  >
                    <IconArrowUp size={14} className="mr-1" /> Push
                  </Button>

                  {/* Fast Refresh Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fetchStatus()}
                    title="Refresh Git status"
                  >
                    <IconRefresh size={14} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {errorBanner && (
              <div className="flex items-center gap-2 p-2 px-3 text-xs bg-rose-500/10 text-rose-400 border-b border-rose-500/20">
                <IconAlertCircle size={14} />
                <span>{errorBanner}</span>
              </div>
            )}

            {/* Merge Conflict Banner */}
            {gitStatus?.conflicted && gitStatus.conflicted.length > 0 && (
              <div className="flex items-center justify-between p-2 px-3 text-xs bg-rose-500/15 text-rose-400 border-b border-rose-500/30">
                <div className="flex items-center gap-1.5">
                  <IconAlertCircle size={14} className="text-rose-400 flex-shrink-0" />
                  <span>
                    <strong>Merge Conflict:</strong> {gitStatus.conflicted.length} conflicting file(s) detected. Resolve conflicts or abort the merge.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  color="danger"
                  onClick={handleAbortMerge}
                  className="text-xs"
                >
                  Abort Merge
                </Button>
              </div>
            )}

            {/* Remote Origin Alert */}
            {!hasConfiguredRemote() && activeTab !== 'github' && (
              <div className="flex items-center justify-between p-2 px-3 text-xs bg-yellow-500/10 text-yellow-500 border-b border-yellow-500/20">
                <div className="flex items-center gap-1.5">
                  <IconAlertCircle size={14} />
                  <span>Remote repository (origin) has not been configured yet. Set a remote URL to enable Push, Pull, and Fetch.</span>
                </div>
                <button
                  type="button"
                  className="font-medium underline hover:text-yellow-400 cursor-pointer ml-2 whitespace-nowrap"
                  onClick={() => handleTabChange('github')}
                >
                  Configure Remote & GitHub
                </button>
              </div>
            )}

            {/* Tab 1: CHANGES VIEW */}
            {activeTab === 'changes' && (
              <div className="git-body-container">
                <div className={`git-sidebar ${mobileActivePane === 'files' ? 'flex' : 'hidden md:flex'}`}>
                  {/* Conflicted Files List */}
                  {gitStatus.conflicted?.length > 0 && (
                    <>
                      <div className="git-section-header text-rose-400 font-semibold">
                        <span>Conflicted Files ({gitStatus.conflicted.length})</span>
                      </div>
                      <div className="git-file-list" style={{ maxHeight: '140px' }}>
                        {gitStatus.conflicted.map((file) => (
                          <div
                            key={file.path}
                            className={`git-file-row ${selectedFile?.path === file.path ? 'selected' : ''}`}
                            onClick={() => handleSelectFile({ ...file, type: 'unstaged' })}
                          >
                            <div className="flex items-center truncate mr-2 min-w-0">
                              <span className="git-status-badge status-u">U</span>
                              <span className="truncate text-rose-300 font-medium" title={file.path}>
                                {file.path}
                              </span>
                            </div>
                            <div className="git-row-actions">
                              <button
                                type="button"
                                className="p-1 hover:text-emerald-400 cursor-pointer text-gray-400"
                                title="Mark as resolved (Stage file)"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStage(file);
                                }}
                              >
                                <IconPlus size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Staged Changes List */}
                  <div className="git-section-header">
                    <span>Staged Changes ({gitStatus.staged?.length || 0})</span>
                    {gitStatus.staged?.length > 0 && (
                      <button
                        type="button"
                        className="text-xs text-yellow-500 hover:underline cursor-pointer lowercase"
                        onClick={handleUnstageAll}
                        title="Unstage all staged files"
                      >
                        unstage all
                      </button>
                    )}
                  </div>

                  <div className="git-file-list" style={{ maxHeight: '180px' }}>
                    {(!gitStatus.staged || gitStatus.staged.length === 0) ? (
                      <div className="p-3 text-xs text-gray-500 text-center">No staged changes</div>
                    ) : (
                      gitStatus.staged.map((file) => (
                        <div
                          key={file.path}
                          className={`git-file-row ${selectedFile?.path === file.path && selectedFile?.type === 'staged' ? 'selected' : ''}`}
                          onClick={() => handleSelectFile({ ...file, type: 'staged' })}
                        >
                          <div className="flex items-center truncate mr-2 min-w-0">
                            {getStatusBadge(file)}
                            <span className="truncate text-gray-200" title={file.path}>
                              {file.path}
                            </span>
                          </div>
                          <div className="git-row-actions">
                            <button
                              type="button"
                              className="p-1 hover:text-rose-400 cursor-pointer text-gray-400"
                              title="Unstage file"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnstage(file);
                              }}
                            >
                              <IconMinus size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Working Tree Changes List */}
                  <div className="git-section-header">
                    <span>Working Tree Changes ({gitStatus.unstaged?.length || 0})</span>
                    <div className="flex items-center gap-2">
                      {gitStatus.unstaged?.length > 0 && (
                        <>
                          <button
                            type="button"
                            className="text-xs text-rose-400 hover:underline cursor-pointer lowercase"
                            onClick={handleDiscardAll}
                            title="Discard all changes"
                          >
                            discard all
                          </button>
                          <span className="text-gray-600">•</span>
                          <button
                            type="button"
                            className="text-xs text-yellow-500 hover:underline cursor-pointer lowercase"
                            onClick={handleStageAll}
                            title="Stage all changes"
                          >
                            stage all
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="git-file-list">
                    {(!gitStatus.unstaged || gitStatus.unstaged.length === 0) ? (
                      <div className="p-6 text-xs text-gray-500 text-center flex flex-col items-center">
                        <IconCheck size={24} className="text-emerald-500 mb-1" />
                        <span>Working tree clean</span>
                      </div>
                    ) : (
                      gitStatus.unstaged.map((file) => (
                        <div
                          key={file.path}
                          className={`git-file-row ${selectedFile?.path === file.path && selectedFile?.type === 'unstaged' ? 'selected' : ''}`}
                          onClick={() => handleSelectFile({ ...file, type: 'unstaged' })}
                        >
                          <div className="flex items-center truncate mr-2 min-w-0">
                            {getStatusBadge(file)}
                            <span className="truncate text-gray-200" title={file.path}>
                              {file.path}
                            </span>
                          </div>
                          <div className="git-row-actions">
                            <button
                              type="button"
                              className="p-1 hover:text-emerald-400 cursor-pointer text-gray-400"
                              title="Stage file"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStage(file);
                              }}
                            >
                              <IconPlus size={14} />
                            </button>
                            <button
                              type="button"
                              className="p-1 hover:text-rose-400 cursor-pointer text-gray-400"
                              title="Discard changes"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDiscard(file);
                              }}
                            >
                              <IconTrash size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Commit Box */}
                  <div className="git-commit-box">
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      {['feat', 'fix', 'refactor', 'docs', 'chore'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="git-conventional-btn"
                          onClick={() => {
                            setCommitMessage((prev) => {
                              if (!prev) return `${tag}: `;
                              if (prev.startsWith(`${tag}: `)) return prev;
                              return `${tag}: ${prev.replace(/^[a-z]+:\s*/, '')}`;
                            });
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                      <div className="ml-auto">
                        <span className="git-secret-guard-badge" title="Pre-commit scanner checks staged diffs for leaked secrets">
                          <IconLock size={11} /> Secret Guard
                        </span>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      className="git-textarea w-full box-sizing: border-box"
                      placeholder="Write a commit message... (Ctrl+Enter to commit)"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          handleCommit();
                        }
                      }}
                    />
                    <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span className="font-mono">{commitMessage.split('\n')[0].length} chars</span>
                        <span>•</span>
                        <span>{gitStatus.staged?.length || 0} file(s) staged</span>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        onClick={handleCommit}
                        loading={isCommitting}
                        disabled={!commitMessage.trim() || !gitStatus.staged?.length}
                      >
                        Commit to {gitStatus.currentGitBranch || 'main'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Diff Viewer Pane */}
                <div className={`git-diff-pane ${mobileActivePane === 'diff' ? 'flex' : 'hidden md:flex'}`}>
                  {selectedFile ? (
                    <>
                      <div className="git-diff-header-bar">
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <button
                            type="button"
                            className="md:hidden flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-400 font-medium mr-1 flex-shrink-0 cursor-pointer"
                            onClick={() => setMobileActivePane('files')}
                          >
                            <IconArrowLeft size={14} />
                            <span>Files</span>
                          </button>
                          <IconFileText size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="font-semibold truncate">{selectedFile.path}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-700/60 text-gray-300 flex-shrink-0">
                            {selectedFile.type === 'staged' ? 'Staged' : 'Working Tree'}
                          </span>
                        </div>

                        {/* Visual Diff Toggle for .bru and .yml files */}
                        {isRequestFile(selectedFile.path) && (
                          <div className="git-toggle-pill-group">
                            <button
                              type="button"
                              className={`git-toggle-pill ${diffViewMode === 'visual' ? 'active' : ''}`}
                              onClick={() => handleToggleDiffMode('visual')}
                              title="Visual request comparison"
                            >
                              <IconLayoutColumns size={13} />
                              <span>Visual</span>
                            </button>
                            <button
                              type="button"
                              className={`git-toggle-pill ${diffViewMode === 'raw' ? 'active' : ''}`}
                              onClick={() => handleToggleDiffMode('raw')}
                              title="Raw unified diff"
                            >
                              <IconCode size={13} />
                              <span>Raw Diff</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {diffLoading ? (
                        <div className="p-6 flex flex-col gap-3">
                          <div className="skeleton-shimmer w-40 h-4 rounded" />
                          <div className="skeleton-shimmer w-full h-4 rounded" />
                          <div className="skeleton-shimmer w-5/6 h-4 rounded" />
                          <div className="skeleton-shimmer w-3/4 h-4 rounded" />
                          <div className="skeleton-shimmer w-2/3 h-4 rounded" />
                        </div>
                      ) : diffViewMode === 'visual' && visualDiffData ? (
                        <div className="visual-diff-wrapper">
                          <VisualDiffViewer
                            oldData={visualDiffData.oldParsed}
                            newData={visualDiffData.newParsed}
                            oldLabel="Before (Committed)"
                            newLabel="After (Working Copy)"
                          />
                        </div>
                      ) : (
                        <div className="diff-view-content">
                          {renderDiffLines(fileDiff)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="git-empty-diff">
                      <IconFileText size={42} className="empty-icon" />
                      <div className="empty-title">Select a file to inspect diff</div>
                      <div className="empty-hint">Click on any modified, staged, or conflicted file in the left sidebar to view its visual or raw diff.</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: COMMIT HISTORY VIEW */}
            {activeTab === 'history' && (
              <div className="git-history-container">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-200">
                    Commit History on <span className="text-yellow-500">{gitStatus.currentGitBranch}</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{historyLogs?.length || 0} commits</span>
                    <Button size="sm" variant="ghost" onClick={() => loadHistoryLogs(50, 0)} title="Refresh history">
                      <IconRefresh size={13} />
                    </Button>
                  </div>
                </div>

                {historyLoading && historyLogs.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="skeleton-shimmer w-full h-16 rounded" />
                    <div className="skeleton-shimmer w-full h-16 rounded" />
                    <div className="skeleton-shimmer w-full h-16 rounded" />
                  </div>
                ) : (!historyLogs || historyLogs.length === 0) ? (
                  <div className="p-12 text-center text-sm text-gray-400">
                    No commits yet on this branch.
                  </div>
                ) : (
                  <>
                    {historyLogs.map((commit) => {
                      const isExpanded = expandedCommitHash === commit.hash;
                      const changedFiles = commitFilesMap[commit.hash] || [];

                      return (
                        <div key={commit.hash} className={`commit-card ${isExpanded ? 'expanded' : ''}`}>
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => handleToggleCommitExpand(commit.hash)}
                          >
                            <div className="flex items-center gap-2 min-w-0 mr-2">
                              {isExpanded ? (
                                <IconChevronDown size={14} className="text-yellow-500 flex-shrink-0" />
                              ) : (
                                <IconChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                              )}
                              <span className="font-semibold text-xs text-gray-200 truncate">
                                {commit.message}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="git-hash-badge">
                                {commit.hash.slice(0, 7)}
                              </span>
                              <button
                                type="button"
                                className="p-1 hover:text-yellow-500 text-gray-400 cursor-pointer transition-colors"
                                title="Copy full commit SHA"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(commit.hash);
                                  toast.success('Commit SHA copied');
                                }}
                              >
                                <IconCopy size={13} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1 flex-wrap">
                            <div className="git-author-avatar">
                              {commit.author_name ? commit.author_name[0].toUpperCase() : 'G'}
                            </div>
                            <span className="font-medium text-gray-300">{commit.author_name}</span>
                            <span>•</span>
                            <span>{new Date(commit.date).toLocaleString()}</span>
                            {commit.filesChanged > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-gray-300">
                                  {commit.filesChanged} file{commit.filesChanged > 1 ? 's' : ''} (
                                  {commit.insertions > 0 && <span className="text-emerald-400 mr-1">+{commit.insertions}</span>}
                                  {commit.deletions > 0 && <span className="text-rose-400">-{commit.deletions}</span>})
                                </span>
                              </>
                            )}
                          </div>

                          {/* Expanded Commit Details */}
                          {isExpanded && (
                            <div className="commit-files-box">
                              <div className="text-[11px] font-semibold text-gray-400 mb-2">
                                Files changed in this commit:
                              </div>
                              {changedFiles.length === 0 ? (
                                <div className="text-xs text-gray-500 py-2">Loading changed files...</div>
                              ) : (
                                <div className="space-y-1 mb-3">
                                  {changedFiles.map((file) => (
                                    <div
                                      key={file.path}
                                      className={`flex items-center justify-between p-1.5 px-2 rounded text-xs cursor-pointer ${
                                        selectedCommitFile?.path === file.path ? 'bg-yellow-500/10 text-yellow-400 font-medium border border-yellow-500/30' : 'hover:opacity-80 text-gray-300'
                                      }`}
                                      onClick={() => handleSelectCommitFile(commit.hash, file)}
                                    >
                                      <div className="flex items-center gap-1.5 truncate">
                                        {getStatusBadge(file)}
                                        <span className="truncate">{file.path}</span>
                                      </div>
                                      <span className="text-[10px] text-gray-500 uppercase">{file.status}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {selectedCommitFile && (
                                <div className="git-card-nested mt-2">
                                  <div className="text-xs font-mono font-semibold text-gray-300 mb-2 pb-1 border-b border-gray-700/50">
                                    {selectedCommitFile.path}
                                  </div>
                                  {commitDiffLoading ? (
                                    <div className="text-xs text-gray-500 py-2">Loading diff...</div>
                                  ) : (
                                    <div className="diff-view-content max-h-60">
                                      {renderDiffLines(commitFileDiff)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="text-center mt-4 mb-2">
                      <Button
                        size="sm"
                        variant="outline"
                        color="secondary"
                        onClick={() => loadHistoryLogs(50, historyLogs.length)}
                        loading={historyLoading}
                      >
                        Load More Commits
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tab 3: STASH VIEW */}
            {activeTab === 'stash' && (
              <div className="git-stash-container">
                {/* Create Stash Box */}
                <div className="stash-create-box">
                  <h4 className="text-sm font-semibold mb-1">Stash Changes</h4>
                  <p className="text-xs text-gray-400 mb-3">
                    Temporarily shelve (stash) your working tree and untracked changes to keep your directory clean.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      className="git-input flex-1"
                      placeholder="Stash message (optional)..."
                      value={stashMessageInput}
                      onChange={(e) => setStashMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateStash();
                      }}
                    />
                    <Button
                      size="sm"
                      color="primary"
                      onClick={handleCreateStash}
                      loading={isStashing}
                      disabled={totalChangesCount === 0}
                    >
                      <IconArchive size={14} className="mr-1" /> Stash Working Tree
                    </Button>
                  </div>
                  {totalChangesCount === 0 && (
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      No modified or untracked files to stash.
                    </span>
                  )}
                </div>

                {/* Stashes List */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-200">
                    Saved Stashes ({stashes.length})
                  </h4>
                  <Button size="sm" variant="ghost" onClick={loadStashes} title="Refresh stashes">
                    <IconRefresh size={13} />
                  </Button>
                </div>

                {stashesLoading && stashes.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="skeleton-shimmer w-full h-14 rounded" />
                    <div className="skeleton-shimmer w-full h-14 rounded" />
                  </div>
                ) : stashes.length === 0 ? (
                  <div className="p-12 text-center text-sm text-gray-400">
                    No stashed changes saved.
                  </div>
                ) : (
                  stashes.map((stash) => {
                    const isExpanded = activeStashIndex === stash.index;

                    return (
                      <div key={stash.index} className="stash-card">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div
                            className="flex items-center gap-2 cursor-pointer min-w-0"
                            onClick={() => handleToggleStashExpand(stash.index)}
                          >
                            {isExpanded ? (
                              <IconChevronDown size={14} className="text-yellow-500 flex-shrink-0" />
                            ) : (
                              <IconChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                            )}
                            <span className="git-hash-badge text-yellow-500 flex-shrink-0">
                              stash@&#123;{stash.index}&#125;
                            </span>
                            <span className="font-medium text-xs truncate" title={stash.message}>
                              {stash.message}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              color="secondary"
                              onClick={() => handleApplyStash(stash.index)}
                              title="Apply this stash to current working tree"
                            >
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              color="danger"
                              onClick={() => handleDropStash(stash.index)}
                              title="Delete this stash"
                            >
                              <IconTrash size={14} />
                            </Button>
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-500 mt-1 ml-6">
                          {new Date(stash.date).toLocaleString()}
                        </div>

                        {/* Expanded Stash Files */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-700/50 ml-6">
                            <div className="text-[11px] font-semibold text-gray-400 mb-2">
                              Files in this stash:
                            </div>
                            {stashFiles.length === 0 ? (
                              <div className="text-xs text-gray-500 py-1">Loading stash files...</div>
                            ) : (
                              <div className="space-y-1 mb-2">
                                {stashFiles.map((file) => (
                                  <div
                                    key={file.path}
                                    className={`flex items-center justify-between p-1.5 px-2 rounded text-xs cursor-pointer ${
                                      selectedStashFile?.path === file.path ? 'bg-yellow-500/10 text-yellow-400 font-medium border border-yellow-500/30' : 'hover:opacity-80 text-gray-300'
                                    }`}
                                    onClick={() => handleSelectStashFile(stash.index, file)}
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      {getStatusBadge(file)}
                                      <span className="truncate">{file.path}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 uppercase">{file.status}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {selectedStashFile && (
                              <div className="git-card-nested mt-2">
                                <div className="text-xs font-mono font-semibold text-gray-300 mb-2 pb-1 border-b border-gray-700/50">
                                  {selectedStashFile.path}
                                </div>
                                {stashDiffLoading ? (
                                  <div className="text-xs text-gray-500 py-2">Loading stash diff...</div>
                                ) : (
                                  <div className="diff-view-content max-h-60">
                                    {renderDiffLines(stashDiffText)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 4: GITHUB ACCOUNT & REMOTES VIEW */}
            {activeTab === 'github' && (
              <div className="github-tab-container">
                {/* GitHub Account Section */}
                <div className="github-card mb-6">
                  <div className="flex items-start sm:items-center gap-3 mb-4">
                    <IconBrandGithub size={28} className="flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <h4 className="text-sm font-semibold">GitHub Account Integration</h4>
                      <p className="text-xs text-gray-400">
                        Connect with your GitHub account for authenticated 1-click Push, Pull, and Fetch operations.
                      </p>
                    </div>
                  </div>

                  {githubAuth ? (
                    <div className="git-card-nested flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={githubAuth.user.avatar_url}
                          alt={githubAuth.user.login}
                          className="w-12 h-12 rounded-full border border-gray-600 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm truncate">{githubAuth.user.name}</span>
                            <span className="text-xs text-gray-400">@{githubAuth.user.login}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                              <IconCheck size={13} /> Verified for Git Sync
                            </span>
                            <button
                              type="button"
                              className="text-[11px] text-yellow-500 hover:underline flex items-center gap-1 cursor-pointer"
                              onClick={() => openExternalUrl(githubAuth.user.html_url)}
                            >
                              <span>View Profile</span>
                              <IconExternalLink size={11} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        color="danger"
                        className="w-full sm:w-auto"
                        onClick={handleDisconnectGithub}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="git-card-nested text-xs leading-relaxed">
                        <p className="font-semibold mb-1">Cara Menghubungkan:</p>
                        <ol className="list-decimal list-inside space-y-1 text-gray-400">
                          <li>Klik tombol di bawah untuk membuat Personal Access Token di GitHub (permission <code className="text-yellow-400 font-mono text-[11px]">repo</code> otomatis dipilih).</li>
                          <li>Salin token yang dihasilkan dan tempelkan pada kolom di bawah.</li>
                        </ol>
                        <button
                          type="button"
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium cursor-pointer border border-gray-700 hover:border-gray-500 transition-colors w-full sm:w-auto justify-center"
                          onClick={() => openExternalUrl(GITHUB_TOKEN_CREATE_URL)}
                        >
                          <IconExternalLink size={14} />
                          <span>Generate Token on GitHub ↗</span>
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-300">
                          GitHub Personal Access Token (classic atau fine-grained):
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="relative flex-1 min-w-0">
                            <input
                              type={showTokenText ? 'text' : 'password'}
                              className="git-input w-full pr-10 font-mono box-sizing: border-box"
                              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                              value={githubTokenInput}
                              onChange={(e) => setGithubTokenInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConnectGithub();
                              }}
                            />
                            <button
                              type="button"
                              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors"
                              onClick={() => setShowTokenText(!showTokenText)}
                              title={showTokenText ? 'Hide token' : 'Show token'}
                            >
                              {showTokenText ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                            </button>
                          </div>
                          <Button
                            size="md"
                            color="primary"
                            className="w-full sm:w-auto whitespace-nowrap"
                            onClick={handleConnectGithub}
                            loading={isVerifyingGithub}
                            disabled={!githubTokenInput.trim()}
                          >
                            Connect GitHub
                          </Button>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          Token disimpan secara lokal di mesin Anda dan digunakan untuk otentikasi Git HTTPS ke GitHub.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remote URL Configuration Section */}
                <div className="github-card">
                  <div className="flex items-start sm:items-center gap-3 mb-4">
                    <IconLink size={24} className="text-yellow-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <h4 className="text-sm font-semibold">Remote Repository Configuration</h4>
                      <p className="text-xs text-gray-400">
                        Atur URL remote repository (<span className="font-mono text-gray-300">origin</span>) tempat koleksi ini disinkronkan.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                        Remote URL (origin):
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          className="git-input flex-1 min-w-0 font-mono"
                          placeholder="https://github.com/username/repository.git"
                          value={remoteUrlInput}
                          onChange={(e) => setRemoteUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRemote();
                          }}
                        />
                        <Button
                          size="md"
                          color="primary"
                          className="w-full sm:w-auto whitespace-nowrap"
                          onClick={handleSaveRemote}
                          loading={isSavingRemote}
                          disabled={!remoteUrlInput.trim()}
                        >
                          Simpan URL
                        </Button>
                      </div>
                    </div>

                    <div className="git-card-nested text-xs space-y-1">
                      <p className="m-0">
                        <strong>Status Remote:</strong>{' '}
                        {hasConfiguredRemote() ? (
                          <span className="text-emerald-400 font-medium">Terkoneksi ke {gitStatus.gitRepoUrl || 'origin'}</span>
                        ) : (
                          <span className="text-yellow-400 font-medium">Belum ada remote URL</span>
                        )}
                      </p>
                      <p className="m-0 text-[11px]">
                        Jika menggunakan HTTPS dengan repositori GitHub privat, token yang Anda hubungkan di atas akan digunakan secara otomatis saat Push, Pull, dan Fetch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </StyledWrapper>
    </Modal>
  );
};

export default GitSyncModal;
