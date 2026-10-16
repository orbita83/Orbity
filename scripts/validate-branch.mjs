import { createInterface } from 'node:readline';
import conventions from './conventions.cjs';

const { prefixes } = conventions;
const permanentBranches = new Set(['main', 'development']);
const branchPattern = new RegExp(`^(?:${prefixes.join('|')})/[a-z][a-z0-9]*(?:-[a-z0-9]+)*$`);

let invalid = false;
const refs = createInterface({ input: process.stdin, crlfDelay: Infinity });

for await (const line of refs) {
  if (!line.trim()) continue;

  const fields = line.trim().split(/\s+/);
  if (fields.length !== 4) {
    console.error(`Referência de push inválida: ${line}`);
    invalid = true;
    continue;
  }

  const [localRef, localObject, remoteRef] = fields;
  if (!remoteRef.startsWith('refs/heads/')) continue;
  if (localRef === '(delete)' || /^0+$/.test(localObject)) continue;

  const branch = remoteRef.slice('refs/heads/'.length);
  if (permanentBranches.has(branch) || branchPattern.test(branch)) continue;

  console.error(`Nome de branch remota inválido: ${branch} (${remoteRef})`);
  console.error(`Use prefixo/descricao-curta, com prefixo ${prefixes.join(', ')}.`);
  console.error('Use letras minúsculas, números e hífens na descrição, sem espaços ou acentos.');
  invalid = true;
}

if (invalid) process.exitCode = 1;
