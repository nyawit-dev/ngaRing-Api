const os = require('os');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const electronDir = path.join(rootDir, 'packages', 'bruno-electron');
const appDistDir = path.join(rootDir, 'packages', 'bruno-app', 'dist');
const electronWebDir = path.join(electronDir, 'web');
const electronOutDir = path.join(electronDir, 'out');

async function deleteFileIfExists(filePath) {
  try {
    const exists = await fs.pathExists(filePath);
    if (exists) {
      await fs.remove(filePath);
      console.log(`${filePath} has been successfully deleted.`);
    } else {
      console.log(`${filePath} does not exist.`);
    }
  } catch (err) {
    console.error(`Error while checking the existence of ${filePath}: ${err}`);
  }
}

async function copyFolderIfExists(srcPath, destPath) {
  try {
    const exists = await fs.pathExists(srcPath);
    if (exists) {
      await fs.copy(srcPath, destPath);
      console.log(`${srcPath} has been successfully copied.`);
    } else {
      console.log(`${srcPath} was not copied as it does not exist.`);
    }
  } catch (err) {
    console.error(`Error while checking the existence of ${srcPath}: ${err}`);
  }
}

async function removeSourceMapFiles(directory) {
  try {
    const files = await fs.readdir(directory);
    for (const file of files) {
      if (file.endsWith('.map')) {
        const filePath = path.join(directory, file);
        await fs.remove(filePath);
        console.log(`${filePath} has been successfully deleted.`);
      }
    }
  } catch (error) {
    console.error(`Error while deleting .map files: ${error}`);
  }
}

async function execCommandWithOutput(command, cwd) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, {
      stdio: 'inherit',
      shell: true,
      cwd: cwd || rootDir
    });
    childProcess.on('error', (error) => {
      reject(error);
    });
    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command}" exited with code ${code}.`));
      }
    });
  });
}

async function main() {
  try {
    // Remove out directory
    await deleteFileIfExists(electronOutDir);

    // Remove web directory
    await deleteFileIfExists(electronWebDir);

    // Create a new web directory
    await fs.ensureDir(electronWebDir);
    console.log('The web directory has been created successfully!');

    // Check if web app build exists
    const appDistIndex = path.join(appDistDir, 'index.html');
    const hasDist = await fs.pathExists(appDistIndex);
    if (!hasDist) {
      throw new Error(`Web build not found at ${appDistDir}. Run build:web first.`);
    }

    // Copy build
    await copyFolderIfExists(appDistDir, electronWebDir);

    // Update static paths
    const files = await fs.readdir(electronWebDir);
    for (const file of files) {
      if (file.endsWith('.html')) {
        const htmlPath = path.join(electronWebDir, file);
        let content = await fs.readFile(htmlPath, 'utf8');
        content = content.replace(/\/static/g, './static');
        await fs.writeFile(htmlPath, content);
      }
    }

    // Update font load paths
    const cssDir = path.join(electronWebDir, 'static', 'css');
    try {
      const cssExists = await fs.pathExists(cssDir);
      if (cssExists) {
        const cssFiles = await fs.readdir(cssDir);
        for (const file of cssFiles) {
          if (file.endsWith('.css')) {
            const filePath = path.join(cssDir, file);
            let content = await fs.readFile(filePath, 'utf8');
            content = content.replace(/\/static\/font/g, '../../static/font');
            await fs.writeFile(filePath, content);
          }
        }
      }
    } catch (error) {
      console.error(`Error updating font paths: ${error}`);
    }

    // Remove sourcemaps
    await removeSourceMapFiles(electronWebDir);

    // Run dist command
    console.log('Building the Electron distribution');

    // Determine the OS and set the appropriate argument
    let osArg = process.argv[2];
    if (!osArg) {
      if (os.platform() === 'win32') {
        osArg = 'win';
      } else if (os.platform() === 'darwin') {
        osArg = 'mac';
      } else {
        osArg = 'linux';
      }
    }

    const isBun = typeof Bun !== 'undefined' || !!process.versions.bun;
    const distCmd = isBun
      ? `bun run dist:${osArg}`
      : `npm run dist:${osArg}`;
    console.log(`Executing: ${distCmd} in ${electronDir}`);
    await execCommandWithOutput(distCmd, electronDir);
    console.log(`Electron distribution built successfully for ${osArg}!`);
  } catch (error) {
    console.error('An error occurred during Electron build:', error);
    process.exit(1);
  }
}

main();
