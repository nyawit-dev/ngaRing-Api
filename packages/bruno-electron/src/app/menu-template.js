const { ipcMain, BrowserWindow, shell } = require('electron');
const os = require('os');
const { version } = require('../../package.json');
const aboutBruno = require('./about-bruno');

const template = [
  {
    label: 'Collection',
    submenu: [
      {
        label: 'Open Collection',
        click() {
          ipcMain.emit('menu:open-collection');
        }
      },
      {
        label: 'Open Recent',
        role: 'recentdocuments',
        visible: os.platform() == 'darwin',
        submenu: [
          {
            label: 'Clear Recent',
            role: 'clearrecentdocuments'
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click() {
          ipcMain.emit('main:start-quit-flow');
        }
      },
      {
        label: 'Force Quit',
        click() {
          process.exit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'toggledevtools' },
      { type: 'separator' },
      {
        label: 'Actual Size',
        accelerator: 'CommandOrControl+0',
        registerAccelerator: false,
        click() {
          ipcMain.emit('menu:reset-zoom');
        }
      },
      {
        label: 'Zoom In',
        accelerator: 'CommandOrControl+Plus',
        registerAccelerator: false,
        click() {
          ipcMain.emit('menu:zoom-in');
        }
      },
      {
        label: 'Zoom Out',
        accelerator: 'CommandOrControl+-',
        registerAccelerator: false,
        click() {
          ipcMain.emit('menu:zoom-out');
        }
      },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'window',
    submenu: [{ role: 'minimize' }, { role: 'close', accelerator: 'CommandOrControl+Shift+Q' }]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'About NgaRingApi',
        click: () => {
          const aboutWindow = new BrowserWindow({
            width: 540,
            height: 620,
            resizable: true,
            minWidth: 460,
            minHeight: 500,
            maximizable: false,
            title: 'About NgaRingApi',
            backgroundColor: '#0b0f17',
            webPreferences: {
              nodeIntegration: true
            }
          });
          aboutWindow.removeMenu();
          aboutWindow.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
          });
          aboutWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(aboutBruno({ version }))}`);
        }
      },
      { type: 'separator' },
      { label: 'Documentation', click: () => ipcMain.emit('main:open-docs') }
    ]
  }
];

module.exports = template;
