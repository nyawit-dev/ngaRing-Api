const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  label: (label, msg) => console.log(`${colors.bright}${colors.magenta}[${label}]${colors.reset} ${msg}`)
};

const rootDir = path.join(__dirname, '..');
const webDir = path.join(rootDir, 'packages/bruno-app');
const electronDir = path.join(rootDir, 'packages/bruno-electron');

let electronProcess = null;
let detectedPort = null;
let electronStarted = false;

// ANSI stripper to reliably parse terminal output containing colors
const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');

// Regex to match rsbuild's local URL output (e.g., "➜ Local:    http://localhost:3000/")
const portRegex = /Local:\s*http:\/\/localhost:(\d+)/i;

console.log(`\n${colors.bright}${colors.yellow}🚀 Starting Bruno development environment...${colors.reset}\n`);

const pkgManager = 'bun';

// Start the rsbuild dev server
const webProcess = spawn(pkgManager, ['run', 'dev'], {
  cwd: webDir,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

function handleOutput(data) {
  const output = data.toString();
  const clean = stripAnsi(output);

  // If compilation finished, immediately launch Electron
  if (clean.includes('ready') && (clean.includes('built in') || clean.includes('ready in'))) {
    tryLaunchElectron(detectedPort || 3000);
    return;
  }

  // Try to detect the port from rsbuild output
  if (!detectedPort) {
    const match = clean.match(portRegex) || clean.match(/localhost:(\d+)/i);
    if (match) {
      detectedPort = match[1];
      log.success(`Detected dev server on port ${colors.bright}${detectedPort}${colors.reset}`);
      log.info(`Waiting for React bundle to finish building before launching Electron...`);
      waitForServer(detectedPort, () => {
        tryLaunchElectron(detectedPort);
      });
    }
  }
}

webProcess.stdout.on('data', (data) => {
  process.stdout.write(data.toString());
  handleOutput(data);
});

webProcess.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
  handleOutput(data);
});

webProcess.on('close', (code) => {
  log.info(`Web process exited with code ${code}`);
  cleanup();
});

function tryLaunchElectron(port) {
  if (electronStarted) return;
  electronStarted = true;
  if (pollInterval) clearInterval(pollInterval);
  log.success(`Dev server is ready! Launching Electron...`);
  startElectron(port);
}

// Proactive poll timer: checks whether dev server is responsive even before/if output regex fires
const pollInterval = setInterval(() => {
  if (electronStarted) {
    clearInterval(pollInterval);
    return;
  }
  const portsToTry = detectedPort ? [detectedPort] : [3000, 3001];
  for (const port of portsToTry) {
    const req = http.get(`http://localhost:${port}`, (res) => {
      if (!electronStarted && res.statusCode) {
        tryLaunchElectron(port);
      }
    });
    req.on('error', () => {});
    req.setTimeout(600, () => req.destroy());
  }
}, 800);

function waitForServer(port, callback) {
  let done = false;
  const check = () => {
    if (done || electronStarted) return;
    const req = http.get(`http://localhost:${port}`, (res) => {
      if (!done && !electronStarted && res.statusCode) {
        done = true;
        callback();
      }
    });
    req.on('error', () => {
      if (!done && !electronStarted) setTimeout(check, 500);
    });
    req.setTimeout(1000, () => {
      req.destroy();
      if (!done && !electronStarted) setTimeout(check, 500);
    });
  };
  check();
}

function startElectron(port) {
  log.info(`Starting Electron with ${colors.cyan}BRUNO_DEV_PORT=${port}${colors.reset}`);

  electronProcess = spawn(pkgManager, ['run', 'dev'], {
    cwd: electronDir,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      BRUNO_DEV_PORT: port
    }
  });

  electronProcess.on('close', (code) => {
    log.info(`Electron process exited with code ${code}`);
    cleanup();
  });
}

function cleanup() {
  if (pollInterval) clearInterval(pollInterval);
  if (webProcess && !webProcess.killed) {
    webProcess.kill();
  }
  if (electronProcess && !electronProcess.killed) {
    electronProcess.kill();
  }
  process.exit(0);
}

// Handle termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
