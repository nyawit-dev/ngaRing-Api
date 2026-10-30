const { autoUpdater } = require('electron-updater');
const { ipcMain, app, shell } = require('electron');
const isDev = require('electron-is-dev');

function registerUpdaterIpc(mainWindow) {
  let updateState = {
    status: 'idle', // 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
    currentVersion: app.getVersion(),
    availableVersion: null,
    releaseDate: null,
    releaseNotes: null,
    progress: null, // { percent, bytesPerSecond, transferred, total }
    error: null,
    lastCheckedAt: null
  };

  const broadcastState = () => {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send('main:updater-status', updateState);
    }
  };

  try {
    // Configure logger
    autoUpdater.logger = console;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Disable Authenticode signature validation for open-source / community releases
    try {
      autoUpdater.verifySignature = () => Promise.resolve(null);
      autoUpdater.verifyUpdateCodeSignature = () => Promise.resolve(null);
      const proto = Object.getPrototypeOf(autoUpdater);
      if (proto && typeof proto.verifySignature === 'function') {
        proto.verifySignature = () => Promise.resolve(null);
      }
    } catch (sigErr) {
      console.warn('[Updater] Could not patch verifySignature:', sigErr.message);
    }

    // Listeners from electron-updater
    autoUpdater.on('checking-for-update', () => {
      console.log('[Updater] Checking for update...');
      updateState.status = 'checking';
      updateState.error = null;
      broadcastState();
    });

    autoUpdater.on('update-available', (info) => {
      console.log(`[Updater] Update available: v${info.version}`);
      updateState.status = 'available';
      updateState.availableVersion = info.version;
      updateState.releaseDate = info.releaseDate;
      updateState.releaseNotes = info.releaseNotes;
      updateState.error = null;
      broadcastState();
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('[Updater] Update not available. Current version is up to date.');
      updateState.status = 'not-available';
      updateState.availableVersion = info?.version || app.getVersion();
      updateState.error = null;
      broadcastState();
    });

    autoUpdater.on('download-progress', (progressObj) => {
      updateState.status = 'downloading';
      updateState.progress = {
        percent: Math.min(100, Math.max(0, Math.round(progressObj.percent || 0))),
        bytesPerSecond: progressObj.bytesPerSecond || 0,
        transferred: progressObj.transferred || 0,
        total: progressObj.total || 0
      };
      broadcastState();
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log(`[Updater] Update downloaded: v${info.version}`);
      updateState.status = 'downloaded';
      updateState.availableVersion = info.version;
      updateState.progress = { percent: 100, bytesPerSecond: 0, transferred: 0, total: 0 };
      updateState.error = null;
      broadcastState();
    });

    autoUpdater.on('error', (err) => {
      console.error('[Updater] Error:', err ? err.message : err);
      updateState.status = 'error';
      updateState.error = err ? err.message : 'Unknown update check error';
      broadcastState();
    });
  } catch (initErr) {
    console.error('[Updater] Failed to initialize electron-updater:', initErr);
  }

  const triggerCheckForUpdates = async (isManual = false) => {
    updateState.lastCheckedAt = new Date().toISOString();

    if (isDev || !app.isPackaged) {
      console.log('[Updater] App is in development mode. Simulating update check...');
      updateState.status = 'checking';
      broadcastState();

      setTimeout(() => {
        updateState.status = 'not-available';
        updateState.availableVersion = app.getVersion();
        broadcastState();
      }, 1000);

      return { status: 'dev-mode', version: app.getVersion() };
    }

    try {
      updateState.error = null;
      updateState.status = 'checking';
      broadcastState();
      const result = await autoUpdater.checkForUpdates();
      return result;
    } catch (checkErr) {
      console.error('[Updater] Check for updates failed:', checkErr.message);
      updateState.status = 'error';
      updateState.error = checkErr.message;
      broadcastState();
      throw checkErr;
    }
  };

  // IPC Invokes for Renderer
  ipcMain.handle('updater:get-status', () => {
    return updateState;
  });

  ipcMain.handle('updater:check-for-updates', async () => {
    return triggerCheckForUpdates(true);
  });

  ipcMain.handle('updater:open-download-page', (event, target) => {
    let url = 'https://github.com/nyawit-dev/ngaRing-Api/releases';
    if (target) {
      if (typeof target === 'string' && (target.startsWith('http://') || target.startsWith('https://'))) {
        url = target;
      } else {
        const tag = target.startsWith('v') ? target : `v${target}`;
        url = `https://github.com/nyawit-dev/ngaRing-Api/releases/tag/${tag}`;
      }
    }
    console.log('[Updater] Opening URL in external browser:', url);
    shell.openExternal(url);
  });

  ipcMain.handle('updater:start-download', async () => {
    console.log('[Updater] User requested download. Starting downloadUpdate()...');
    updateState.status = 'downloading';
    updateState.progress = { percent: 0, bytesPerSecond: 0, transferred: 0, total: 0 };
    broadcastState();
    try {
      if (isDev || !app.isPackaged) {
        // Dev mode simulation of downloading progress
        let p = 0;
        const interval = setInterval(() => {
          p += 20;
          updateState.progress = {
            percent: Math.min(100, p),
            bytesPerSecond: 3145728, // 3 MB/s
            transferred: (p / 100) * 58000000,
            total: 58000000
          };
          broadcastState();
          if (p >= 100) {
            clearInterval(interval);
            updateState.status = 'downloaded';
            broadcastState();
          }
        }, 500);
        return { status: 'simulated' };
      }
      return await autoUpdater.downloadUpdate();
    } catch (downloadErr) {
      console.error('[Updater] Download error:', downloadErr.message);
      updateState.status = 'error';
      updateState.error = downloadErr.message;
      broadcastState();
      throw downloadErr;
    }
  });

  ipcMain.handle('updater:quit-and-install', () => {
    console.log('[Updater] Quitting and installing update...');
    try {
      autoUpdater.quitAndInstall(false, true);
    } catch (quitErr) {
      console.error('[Updater] Failed to quit and install:', quitErr);
      app.relaunch();
      app.quit();
    }
  });

  // Native menu listener
  ipcMain.on('menu:check-for-updates', () => {
    triggerCheckForUpdates(true).catch(() => {});
  });

  // Automatic background check on app startup (in production)
  if (app.isPackaged) {
    setTimeout(() => {
      triggerCheckForUpdates(false).catch((err) => {
        console.warn('[Updater] Background startup check failed:', err.message);
      });
    }, 15000);

    // Periodic check every 4 hours
    setInterval(() => {
      triggerCheckForUpdates(false).catch((err) => {
        console.warn('[Updater] Periodic check failed:', err.message);
      });
    }, 4 * 60 * 60 * 1000);
  }
}

module.exports = registerUpdaterIpc;
