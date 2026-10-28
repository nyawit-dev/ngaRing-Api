require('dotenv').config({ path: process.env.DOTENV_PATH });

const isBenchmark = process.env.BRUNO_BENCHMARK === 'true';

const config = {
  appId: 'com.ngaringapi.app',
  productName: isBenchmark ? 'NgaRingApi Benchmark' : 'NgaRingApi',
  extraMetadata: {
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
  linux: {
    artifactName: 'NgaRingApi_${version}_${arch}_${os}.${ext}',
    icon: 'resources/icons/png',
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
    desktop: {
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
    publisherName: 'NgaRingApi'
  },
  nsis: {
    include: 'resources/installer.nsh',
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  pkg: {
    installLocation: '/Applications',
    isRelocatable: false
  }
};

module.exports = config;
