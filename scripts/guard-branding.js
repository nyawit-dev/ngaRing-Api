const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function guardBranding() {
  console.log('--- NgaRingApi Branding Guard ---');

  // 1. Guard packages/bruno-electron/package.json
  const electronPkgPath = path.join(rootDir, 'packages', 'bruno-electron', 'package.json');
  if (fs.existsSync(electronPkgPath)) {
    try {
      const content = fs.readFileSync(electronPkgPath, 'utf8');
      const pkg = JSON.parse(content);
      pkg.author = {
        name: 'nyawit.dev',
        email: 'ringga.itdev@batamfast.com',
        url: 'https://github.com/nyawit-dev/ngaRing-Api'
      };
      pkg.homepage = 'https://github.com/nyawit-dev/ngaRing-Api';
      pkg.repository = {
        type: 'git',
        url: 'https://github.com/nyawit-dev/ngaRing-Api.git'
      };
      if (pkg.scripts) {
        for (const key of ['dist:mac', 'dist:win', 'dist:linux', 'dist:deb', 'dist:rpm', 'dist:snap']) {
          if (pkg.scripts[key] && !pkg.scripts[key].includes('--publish never')) {
            pkg.scripts[key] += ' --publish never';
          }
        }
      }
      fs.writeFileSync(electronPkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log('✓ Guarded packages/bruno-electron/package.json');
    } catch (err) {
      console.warn('Warning guarding packages/bruno-electron/package.json:', err.message);
    }
  }

  // 2. Guard packages/bruno-electron/electron-builder-config.js
  const builderConfigPath = path.join(rootDir, 'packages', 'bruno-electron', 'electron-builder-config.js');
  if (fs.existsSync(builderConfigPath)) {
    try {
      let code = fs.readFileSync(builderConfigPath, 'utf8');
      if (!code.includes("productName: isBenchmark ? 'NgaRingApi Benchmark' : 'NgaRingApi'")) {
        code = code.replace(/productName:\s*isBenchmark\s*\?[^,]*,/, "productName: isBenchmark ? 'NgaRingApi Benchmark' : 'NgaRingApi',");
      }
      if (!code.includes("appId: 'com.ngaringapi.app'")) {
        code = code.replace(/appId:\s*['"][^'"]*['"],/, "appId: 'com.ngaringapi.app',");
      }
      if (!code.includes("executableName: 'NgaRingApi'")) {
        code = code.replace(/executableName:\s*['"][^'"]*['"],/, "executableName: 'NgaRingApi',");
      }
      if (!code.includes("copyright: 'Copyright © 2026 nyawit.dev'")) {
        code = code.replace(/const config = {/, "const config = {\n  copyright: 'Copyright © 2026 nyawit.dev',");
      }
      if (!code.includes("publisherName: 'nyawit.dev'")) {
        code = code.replace(/publisherName:\s*['"][^'"]*['"]/, "publisherName: 'nyawit.dev'");
      }
      fs.writeFileSync(builderConfigPath, code);
      console.log('✓ Guarded packages/bruno-electron/electron-builder-config.js');
    } catch (err) {
      console.warn('Warning guarding electron-builder-config.js:', err.message);
    }
  }

  // 3. Guard root package.json
  const rootPkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(rootPkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
      pkg.author = {
        name: 'nyawit.dev',
        email: 'ringga.itdev@batamfast.com',
        url: 'https://github.com/nyawit-dev/ngaRing-Api'
      };
      pkg.homepage = 'https://github.com/nyawit-dev/ngaRing-Api';
      fs.writeFileSync(rootPkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log('✓ Guarded root package.json');
    } catch (err) {
      console.warn('Warning guarding root package.json:', err.message);
    }
  }

  // 4. Guard packages/bruno-electron/resources/installer.nsh
  const installerNshPath = path.join(rootDir, 'packages', 'bruno-electron', 'resources', 'installer.nsh');
  if (fs.existsSync(installerNshPath)) {
    try {
      let nsh = fs.readFileSync(installerNshPath, 'utf8');
      nsh = nsh.replace(/"Publisher"\s+"[^"]*"/g, '"Publisher" "nyawit.dev"');
      fs.writeFileSync(installerNshPath, nsh);
      console.log('✓ Guarded packages/bruno-electron/resources/installer.nsh');
    } catch (err) {
      console.warn('Warning guarding installer.nsh:', err.message);
    }
  }

  console.log('All branding metadata verified and protected.');
}

if (require.main === module) {
  guardBranding();
}

module.exports = guardBranding;
