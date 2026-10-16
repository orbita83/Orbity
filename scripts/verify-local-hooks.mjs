import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const fixture = mkdtempSync(join(projectRoot, '.hook-check-'));
const hookPath = join(projectRoot, '.husky', '_');

function run(command, args, expectedStatus, label) {
  const result = spawnSync(command, args, {
    cwd: fixture,
    encoding: 'utf8',
    env: { ...process.env, npm_config_offline: 'true' },
  });
  if (result.error || result.status !== expectedStatus) {
    throw new Error(`${label}: esperado ${expectedStatus}, obtido ${result.status}\n${result.error ?? ''}\n${result.stdout}\n${result.stderr}`);
  }
  console.log(`OK: ${label}`);
  return result;
}

try {
  mkdirSync(join(fixture, 'scripts'));
  mkdirSync(join(fixture, 'src'));
  for (const file of ['package.json', 'eslint.config.js', 'commitlint.config.cjs']) {
    copyFileSync(join(projectRoot, file), join(fixture, file));
  }
  copyFileSync(join(projectRoot, 'scripts', 'conventions.cjs'), join(fixture, 'scripts', 'conventions.cjs'));
  copyFileSync(join(projectRoot, 'scripts', 'validate-branch.mjs'), join(fixture, 'scripts', 'validate-branch.mjs'));

  run('git', ['init', '--initial-branch=feat/valid-branch'], 0, 'repositório temporário criado');
  const pushInputPath = join(fixture, 'push-refs.txt');
  const push = (input, expectedStatus, label) => {
    writeFileSync(pushInputPath, input);
    return run('git', ['-c', `core.hooksPath=${hookPath}`, 'hook', 'run', `--to-stdin=${pushInputPath}`, 'pre-push'], expectedStatus, label);
  };
  const source = 'a'.repeat(40);
  const destination = 'b'.repeat(40);
  const zero = '0'.repeat(40);
  const ref = (local, remote, localObject = source) => `${local} ${localObject} ${remote} ${destination}\n`;

  push(ref('refs/heads/feat/valid-branch', 'refs/heads/feat/valid-branch'), 0, 'branch de trabalho válida aceita');
  run('git', ['symbolic-ref', 'HEAD', 'refs/heads/invalid-branch'], 0, 'branch inválida preparada');
  push(ref('refs/heads/invalid-branch', 'refs/heads/fix/valid-branch'), 0, 'nome remoto válido aceito com HEAD e nome local inválidos');
  const invalidPush = push(ref('refs/heads/feat/valid-branch', 'refs/heads/invalid-branch'), 1, 'nome remoto inválido rejeitado com nome local válido');
  if (!invalidPush.stderr.includes('invalid-branch')) throw new Error('Mensagem de branch inválida não identifica a referência');
  push(
    ref('refs/heads/feat/valid-branch', 'refs/heads/feat/valid-branch') + ref('refs/heads/fix/other', 'refs/heads/docs/documentacao'),
    0, 'push de múltiplas branches válidas aceito',
  );
  push(
    ['feat', 'fix', 'docs', 'refactor', 'test', 'chore'].map((prefix) => ref('refs/heads/invalid-branch', `refs/heads/${prefix}/exemplo`)).join(''),
    0, 'seis prefixos compartilhados aceitos',
  );
  push(ref('refs/heads/feat/valid-branch', 'refs/heads/build/exemplo'), 1, 'prefixo fora da convenção rejeitado');
  push(
    ref('refs/heads/feat/valid-branch', 'refs/heads/feat/valid-branch') + ref('refs/heads/fix/other', 'refs/heads/invalid-branch'),
    1, 'push de múltiplas referências rejeitado quando uma é inválida',
  );
  push(ref('refs/heads/invalid-branch', 'refs/heads/development') + ref('refs/heads/invalid-branch', 'refs/heads/main'), 0, 'branches permanentes aceitas pela nomenclatura');
  push(ref('refs/tags/v1.0.0', 'refs/tags/v1.0.0'), 0, 'tag não submetida à convenção de branches');
  push(ref('(delete)', 'refs/heads/invalid-branch', zero), 0, 'exclusão de branch remota aceita');

  const messagePath = join(fixture, 'message.txt');
  writeFileSync(messagePath, 'feat(auth): adiciona validacao do login\n');
  run('git', ['-c', `core.hooksPath=${hookPath}`, 'hook', 'run', 'commit-msg', '--', messagePath], 0, 'mensagem válida aceita');
  writeFileSync(messagePath, 'feat: Adiciona validacao\n');
  run('git', ['-c', `core.hooksPath=${hookPath}`, 'hook', 'run', 'commit-msg', '--', messagePath], 1, 'mensagem inválida rejeitada');

  writeFileSync(join(fixture, 'src', 'valid.ts'), 'export const valid = 1;\n');
  writeFileSync(join(fixture, 'src', 'invalid.ts'), 'export const invalid = ;\n');
  run('git', ['add', 'src/valid.ts'], 0, 'arquivo válido preparado');
  run('git', ['-c', `core.hooksPath=${hookPath}`, 'hook', 'run', 'pre-commit'], 0, 'lint ignora arquivo não preparado');
  run('git', ['add', 'src/invalid.ts'], 0, 'arquivo inválido preparado');
  run('git', ['-c', `core.hooksPath=${hookPath}`, 'hook', 'run', 'pre-commit'], 1, 'erro de lint impede commit');
} finally {
  if (!fixture.startsWith(projectRoot + '\\') && !fixture.startsWith(projectRoot + '/')) {
    throw new Error(`Caminho temporário inesperado: ${fixture}`);
  }
  rmSync(fixture, { recursive: true, force: true });
}
