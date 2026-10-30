require('dotenv').config();
const { ipcMain } = require('electron');
const fetch = require('node-fetch');
const { getPreferences, savePreferences } = require('../store/preferences');

const DEFAULT_NGARING_FEED = 'https://raw.githubusercontent.com/nyawit-dev/ngaRing-Api/main/notifications.json';
const BRUNO_FEED = process.env.BRUNO_INFO_ENDPOINT || 'https://appinfo.usebruno.com';

const fetchWithTimeout = async (url, timeoutMs = 5000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    console.warn(`[Notifications] Failed to fetch from ${url}:`, err.message);
    return null;
  }
};

const getNotificationConfig = () => {
  try {
    const prefs = getPreferences();
    const notifPrefs = prefs?.notifications || {};
    return {
      enableBruno: notifPrefs.enableBruno !== false,
      enableCustom: notifPrefs.enableCustom !== false,
      customUrl: notifPrefs.customUrl || DEFAULT_NGARING_FEED
    };
  } catch (err) {
    console.error('[Notifications] Failed to read preferences:', err);
    return {
      enableBruno: true,
      enableCustom: true,
      customUrl: DEFAULT_NGARING_FEED
    };
  }
};

const saveNotificationConfig = async (newConfig) => {
  try {
    const prefs = getPreferences();
    prefs.notifications = {
      ...(prefs.notifications || {}),
      ...newConfig
    };
    await savePreferences(prefs);
    return prefs.notifications;
  } catch (err) {
    console.error('[Notifications] Failed to save notification config:', err);
    throw err;
  }
};

const fetchAllNotifications = async () => {
  const config = getNotificationConfig();
  const promises = [];

  // 1. NgaRingApi / Custom Feed
  if (config.enableCustom && config.customUrl) {
    promises.push(
      fetchWithTimeout(config.customUrl, 5000)
        .then((data) => {
          const list = data?.notifications || (Array.isArray(data) ? data : []);
          return list.map((item) => ({
            ...item,
            source: item.source || 'NgaRingApi',
            type: item.type || 'NgaRingApi',
            color: item.color || '#00f0ff',
            ignoreInstallDate: item.ignoreInstallDate !== false
          }));
        })
        .catch(() => [])
    );
  }

  // 2. Bruno Community Feed
  if (config.enableBruno) {
    promises.push(
      fetchWithTimeout(BRUNO_FEED, 5000)
        .then((data) => {
          const list = data?.notifications || [];
          return list.map((item) => ({
            ...item,
            source: item.source || 'Bruno',
            type: item.type || 'Bruno',
            color: item.color || '#eab308'
          }));
        })
        .catch(() => [])
    );
  }

  const results = await Promise.allSettled(promises);
  const merged = [];
  const seenIds = new Set();

  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      for (const notif of res.value) {
        if (notif && notif.id && !seenIds.has(notif.id)) {
          seenIds.add(notif.id);
          merged.push(notif);
        }
      }
    }
  }

  // Sort: pinned first, then by date descending
  merged.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const timeA = new Date(a.date || a.createdAt || 0).getTime();
    const timeB = new Date(b.date || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return merged;
};

const pushNotifications = async (mainWindow) => {
  try {
    const notifications = await fetchAllNotifications();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('main:load-notifications', notifications);
    }
  } catch (error) {
    console.error('Error while fetching merged notifications!', error);
  }
};

const registerNotificationsIpc = (mainWindow, watcher) => {
  mainWindow.webContents.on('did-finish-load', () => pushNotifications(mainWindow));
  ipcMain.on('renderer:notifications-opened', () => pushNotifications(mainWindow));

  ipcMain.handle('notifications:get-config', async () => {
    return getNotificationConfig();
  });

  ipcMain.handle('notifications:save-config', async (event, config) => {
    const saved = await saveNotificationConfig(config);
    await pushNotifications(mainWindow);
    return saved;
  });

  ipcMain.handle('notifications:refresh', async () => {
    await pushNotifications(mainWindow);
    return true;
  });
};

module.exports = registerNotificationsIpc;
