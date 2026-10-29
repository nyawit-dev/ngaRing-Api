require('dotenv').config({ path: process.env.DOTENV_PATH });

const isBenchmark = process.env.BRUNO_BENCHMARK === 'true';

const config = {
  appId: 'com.ngaringapi.app',
  productName: isBenchmark ? 'NgaRingApi Benchmark' : 'NgaRingApi',
  copyright: 'Copyright © 2026 nyawit.dev',
  publish: {
    provider: 'github',
    owner: 'nyawit-dev',
    repo: 'ngaRing-Api'
  },
  extraMetadata: {
    author: {
      name: 'nyawit.dev',
      email: 'ringga.itdev@batamfast.com',
      url: 'https://github.com/nyawit-dev/ngaRing-Api'
    },
    brunoBuild: {
      benchmark: isBenchmark,
      builtAt: new Date().toISOString()
    }
  },
  electronVersion: '37.6.1',
  npmRebuild: false,
  directories: {
    buildResources: 'resources',
    output: 'out'
  },
  extraResources: [
    {
      from: 'resources/data/sample-collection.json',
      to: 'data/sample-collection.json'
    }
  ],
  files: ['**/*'],
  afterSign: 'notarize.js',
  executableName: 'NgaRingApi',
  mac: {
    artifactName: 'NgaRingApi_${version}_${arch}_${os}.${ext}',
    category: 'public.app-category.developer-tools',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'resources/icons/mac/icon.icns',
    hardenedRuntime: false,
    identity: null,
    notarize: false,
    requirements: 'resources/app-requirements.txt',
    protocols: [
      {
        name: 'NgaRingApi',
        schemes: [
          'ngaringapi'
        ]
      }
    ]
  },
  dmg: {
    title: 'NgaRingApi ${version}',
    icon: 'resources/icons/mac/icon.icns',
    sign: false,
    writeUpdateInfo: false
  },
  linux: {
    artifactName: 'NgaRingApi_${version}_${arch}_${os}.${ext}',
    icon: 'resources/icons/png',
    vendor: 'nyawit.dev',
    maintainer: 'nyawit.dev <ringga.itdev@batamfast.com>',
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      }
    ],
    protocols: [
      {
        name: 'NgaRingApi',
        schemes: ['ngaringapi']
      }
    ],
    category: 'Development',
    synopsis: 'Local-first API IDE and client',
    description: 'Local-first, git-friendly API IDE and client for modern developers.',
    desktop: {
      Name: 'NgaRingApi',
      Comment: 'Local-first, git-friendly API IDE and client for modern developers.',
      MimeType: 'x-scheme-handler/ngaringapi;'
    }
  },
  deb: {
    // Docs: https://www.electron.build/configuration/linux#debian-package-options
    depends: [
      'libgtk-3-0',
      'libnotify4',
      'libnss3',
      'libxss1',
      'libxtst6',
      'xdg-utils',
      'libatspi2.0-0',
      'libuuid1',
      'libsecret-1-0',
      'libasound2' // #1036
    ]
  },
  // Bundle git so Snap/sandbox installs can find it (#5667)
  snap: {
    stagePackages: ['default', 'git'],
    // electron-builder's app part strips usr/bin, so expose git from git-core
    environment: {
      PATH: '$SNAP/usr/lib/git-core:$SNAP/usr/sbin:$SNAP/usr/bin:$SNAP/sbin:$SNAP/bin:$PATH',
      GIT_EXEC_PATH: '$SNAP/usr/lib/git-core'
    }
  },
  win: {
    artifactName: 'NgaRingApi_${version}_${arch}_win.${ext}',
    icon: 'resources/icons/win/icon.ico',
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    sign: null,
    publisherName: 'nyawit.dev',
    legalTrademarks: 'nyawit.dev'
  },
  nsis: {
    include: 'resources/installer.nsh',
    oneClick: false,
    perMachine: false,
    allowElevation: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    runAfterFinish: true,
    shortcutName: 'NgaRingApi',
    installerIcon: 'resources/icons/win/icon.ico',
    uninstallerIcon: 'resources/icons/win/icon.ico',
    uninstallDisplayName: 'NgaRingApi ${version}'
  }
};

module.exports = config;
