/** @jest-environment node */

import { getCachedGitStatus, getGitStatus } from './gitClient';

describe('getGitStatus', () => {
  const ipcRenderer = { invoke: jest.fn() };

  beforeEach(() => {
    ipcRenderer.invoke.mockReset();
    global.window = { ipcRenderer };
  });

  afterEach(() => {
    delete global.window;
  });

  test('reuses recent status results and supports an explicit refresh', async () => {
    const collectionPath = 'git-status-cache-test';
    const initialStatus = { isGit: true, currentGitBranch: 'main' };
    const refreshedStatus = { isGit: true, currentGitBranch: 'feature' };
    ipcRenderer.invoke
      .mockResolvedValueOnce(initialStatus)
      .mockResolvedValueOnce(refreshedStatus);

    expect(await getGitStatus(collectionPath)).toBe(initialStatus);
    expect(await getGitStatus(collectionPath)).toBe(initialStatus);
    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1);

    expect(await getGitStatus(collectionPath, { forceRefresh: true })).toBe(refreshedStatus);
    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(2);
  });

  test('exposes the latest cached status for immediate rendering', async () => {
    const collectionPath = 'git-status-sync-cache-test';
    const status = { isGit: true, currentGitBranch: 'main' };
    ipcRenderer.invoke.mockResolvedValue(status);

    expect(getCachedGitStatus(collectionPath)).toBeNull();
    await getGitStatus(collectionPath);
    expect(getCachedGitStatus(collectionPath)).toBe(status);
  });

  test('shares an in-flight status request for the same collection', async () => {
    const collectionPath = 'git-status-pending-test';
    let resolveStatus;
    const pendingStatus = new Promise((resolve) => {
      resolveStatus = resolve;
    });
    ipcRenderer.invoke.mockReturnValue(pendingStatus);

    const firstRequest = getGitStatus(collectionPath);
    const secondRequest = getGitStatus(collectionPath);
    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1);

    const status = { isGit: true, currentGitBranch: 'main' };
    resolveStatus(status);
    await expect(Promise.all([firstRequest, secondRequest])).resolves.toEqual([status, status]);
  });

  test('runs one fresh request after an ordinary request already in flight', async () => {
    const collectionPath = 'git-status-refresh-pending-test';
    let resolveInitialStatus;
    let resolveRefreshedStatus;
    let resolveRefreshStarted;
    const refreshStarted = new Promise((resolve) => {
      resolveRefreshStarted = resolve;
    });
    const initialRequest = new Promise((resolve) => {
      resolveInitialStatus = resolve;
    });
    const refreshedRequest = new Promise((resolve) => {
      resolveRefreshedStatus = resolve;
    });
    ipcRenderer.invoke
      .mockReturnValueOnce(initialRequest)
      .mockImplementationOnce(() => {
        resolveRefreshStarted();
        return refreshedRequest;
      });

    const initialStatusRequest = getGitStatus(collectionPath);
    const firstRefreshRequest = getGitStatus(collectionPath, { forceRefresh: true });
    const secondRefreshRequest = getGitStatus(collectionPath, { forceRefresh: true });

    resolveInitialStatus({ isGit: true, currentGitBranch: 'main' });
    await refreshStarted;
    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(2);

    const statusDuringRefresh = getGitStatus(collectionPath);
    const refreshedStatus = { isGit: true, currentGitBranch: 'feature' };
    resolveRefreshedStatus(refreshedStatus);
    await expect(initialStatusRequest).resolves.toEqual({ isGit: true, currentGitBranch: 'main' });
    await expect(Promise.all([firstRefreshRequest, secondRefreshRequest])).resolves.toEqual([
      refreshedStatus,
      refreshedStatus
    ]);
    await expect(statusDuringRefresh).resolves.toBe(refreshedStatus);

    expect(await getGitStatus(collectionPath)).toBe(refreshedStatus);
    expect(ipcRenderer.invoke).toHaveBeenCalledTimes(2);
  });
});
