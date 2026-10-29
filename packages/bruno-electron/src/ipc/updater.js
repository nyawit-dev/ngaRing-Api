const { autoUpdater } = require('electron-updater');
const { ipcMain, app } = require('electron');
const isDev = require('electron-is-dev');

function registerUpdaterIpc(mainWindow) {
  let updateState = {
    status: 'idle', // 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
    currentVersion: app.getVersion(),
    availableVersion: null,
    releaseDate: null,
    releaseNotes: null,
    progress: null, // { percent, bytesPerSecond, transferred, total }
    error: null
  };

  const broadcastState = () => {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send('main:updater-status', updateState);
    }
  };

  try {
    // Configure logger
    autoUpdater.logger = console;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

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
    if (isDev || !app.isPackaged) {
      console.log('[Updater] App is in development mode. Simulating update check...');
      updateState.status = 'checking';
      broadcastState();

      setTimeout(() => {
        updateState.status = 'not-available';
        updateState.availableVersion = app.getVersion();
        broadcastState();
      }, 1200);

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

  ipcMain.handle('updater:quit-and-install', () => {
    console.log('[Updater] Quitting and installing update...');
    try {
      autoUpdater.quitAndInstall(false, true);
    } catch (quitErr) {
      console.error('[Updater] Failed to quit and install:', quitErr);
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
