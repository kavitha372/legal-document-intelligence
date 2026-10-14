// Dev server launcher - bypasses ts-node-dev project root bug with Node 24
// Uses tsx (faster, Node 24 compatible) or falls back to ts-node with explicit flags

const { spawn } = require('child_process');
const path = require('path');

const cwd = __dirname;

// Try tsx first (bundled with Node 24 compatible)
// Fall back to ts-node with explicit tsconfig
function startServer() {
  console.log('Starting Legal Document Intelligence Backend...');
  
  const tsNodeDev = path.join(cwd, 'node_modules', '.bin', 'ts-node-dev.cmd');
  
  const proc = spawn(tsNodeDev, [
    '--respawn',
    '--transpile-only', 
    '--project', path.join(cwd, 'tsconfig.json'),
    path.join(cwd, 'src', 'server.ts')
  ], {
    cwd: cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  proc.on('error', (err) => {
    console.error('Failed to start dev server:', err.message);
    process.exit(1);
  });

  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) process.exit(code);
  });

  process.on('SIGINT', () => proc.kill('SIGINT'));
  process.on('SIGTERM', () => proc.kill('SIGTERM'));
}

startServer();
