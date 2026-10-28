export const getGitRootPath = async (collectionPath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return null;
  return ipcRenderer.invoke('renderer:git-root-path', collectionPath);
};

export const initGitRepo = async (collectionPath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-init', collectionPath);
};

export const getGitStatus = async (collectionPath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return { isGit: false };
  return ipcRenderer.invoke('renderer:git-get-status', { collectionPath });
};

export const stageGitFiles = async (gitRootPath, files) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-stage', { gitRootPath, files });
};

export const unstageGitFiles = async (gitRootPath, files) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-unstage', { gitRootPath, files });
};

export const discardGitFiles = async (gitRootPath, files) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-discard', { gitRootPath, files });
};

export const commitGit = async (gitRootPath, message) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-commit', { gitRootPath, message });
};

export const pushGit = async (gitRootPath, remote = 'origin', remoteBranch) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-push', { gitRootPath, remote, remoteBranch });
};

export const pullGit = async (gitRootPath, remote = 'origin', remoteBranch, strategy = '--no-rebase') => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-pull', { gitRootPath, remote, remoteBranch, strategy });
};

export const checkoutGitBranch = async (gitRootPath, branchName, shouldCreate = false) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-checkout-branch', { gitRootPath, branchName, shouldCreate });
};

export const getGitDiff = async (gitRootPath, filePath, staged = false) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-diff', { gitRootPath, filePath, staged });
};

export const fetchGitRemotes = async (gitRootPath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return [];
  return ipcRenderer.invoke('renderer:git-fetch-remotes', gitRootPath);
};

export const addGitRemote = async (gitRootPath, remoteUrl, remoteName = 'origin') => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-add-remote', { gitRootPath, remoteName, remoteUrl });
};

export const verifyGitHubToken = async (token) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:github-verify-token', { token });
};

export const saveGitHubAuth = async (authData) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:github-save-auth', authData);
};

export const getGitHubAuth = async () => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return null;
  return ipcRenderer.invoke('renderer:github-get-auth');
};

export const logoutGitHub = async () => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return false;
  return ipcRenderer.invoke('renderer:github-logout');
};

export const fetchGit = async (gitRootPath, remote = 'origin') => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-fetch', { gitRootPath, remote });
};

export const getGitLogs = async (gitRootPath, limit = 50, skip = 0) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return [];
  return ipcRenderer.invoke('renderer:git-get-logs', { gitRootPath, limit, skip });
};

export const deleteGitBranch = async (gitRootPath, branchName, force = false) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-branch-delete', { gitRootPath, branchName, force });
};

export const createGitStash = async (gitRootPath, message = 'Bruno Auto Stash') => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-stash-create', { gitRootPath, message });
};

export const listGitStashes = async (gitRootPath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return [];
  return ipcRenderer.invoke('renderer:git-stash-list', { gitRootPath });
};

export const applyGitStash = async (gitRootPath, stashIndex = 0) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-stash-apply', { gitRootPath, stashIndex });
};

export const dropGitStash = async (gitRootPath, stashIndex = 0) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-stash-drop', { gitRootPath, stashIndex });
};

export const getGitStashFiles = async (gitRootPath, stashIndex = 0) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return [];
  return ipcRenderer.invoke('renderer:git-stash-files', { gitRootPath, stashIndex });
};

export const getGitStashDiff = async (gitRootPath, stashIndex = 0, filePath, isUntracked = false) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-stash-diff', { gitRootPath, stashIndex, filePath, isUntracked });
};

export const getGitCommitFiles = async (gitRootPath, commitHash) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-commit-files', { gitRootPath, commitHash });
};

export const getGitCommitFileDiff = async (gitRootPath, commitHash, filePath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-commit-file-diff', { gitRootPath, commitHash, filePath });
};

export const getGitVisualDiff = async (gitRootPath, filePath, type = 'unstaged') => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-visual-diff', { gitRootPath, filePath, type });
};

export const getGitFileHistory = async (gitRootPath, filePath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-file-history', { gitRootPath, filePath });
};

export const getGitFileCommitVisualDiff = async (gitRootPath, commitHash, filePath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-file-commit-visual-diff', { gitRootPath, commitHash, filePath });
};

export const abortGitMerge = async (gitRootPath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-abort-merge', { gitRootPath });
};

export const continueGitMerge = async (gitRootPath, conflictedFiles, commitMessage) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-continue-merge', { gitRootPath, conflictedFiles, commitMessage });
};
