// Blocks a commit of package-lock.json made with an npm major other than the one in packageManager (#240).
// npm 10 and npm 11 write different lockfiles, and `npm ci` in CI rejects a lock from a newer npm.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const { packageManager } = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'));
const expected = /^npm@(\d+)\.\d+\.\d+$/.exec(packageManager ?? '');

if (!expected) {
  console.error(`O campo "packageManager" do package.json deve ter o formato npm@<versão>, mas é "${packageManager}".`);
  process.exit(1);
}

// The hook runs through npx, which sets the user agent of the npm in use. Outside npm, ask the npm on PATH.
function currentNpmVersion() {
  const fromUserAgent = /^npm\/(\d+\.\d+\.\d+)/.exec(process.env.npm_config_user_agent ?? '');
  if (fromUserAgent) return fromUserAgent[1];
  const result = spawnSync('npm', ['-v'], { encoding: 'utf8', shell: process.platform === 'win32' });
  return result.status === 0 ? result.stdout.trim() : '';
}

const current = currentNpmVersion();

if (!/^\d+\./.test(current)) {
  console.error('Não foi possível obter a versão do npm.');
  process.exit(1);
}

if (current.split('.')[0] !== expected[1]) {
  console.error(
    [
      `O package-lock.json só pode ser commitado com o npm ${expected[1]}.x (packageManager: ${packageManager}), mas o npm atual é ${current}.`,
      'Um lock gerado por outra versão major do npm falha no `npm ci` do CI.',
      'Para corrigir:',
      '  nvm use',
      '  npm install --package-lock-only',
      '  git add package-lock.json',
    ].join('\n'),
  );
  process.exit(1);
}
