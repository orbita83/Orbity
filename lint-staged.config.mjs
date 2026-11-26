// Configuração do lint-staged, executado pelo .husky/pre-commit.
// Fica num arquivo JS (e não no package.json) porque o linter de arquitetura roda como função:
// uma única vez, no projeto inteiro, sem receber a lista de arquivos preparados.
export default {
  "*.{js,cjs,mjs,jsx,ts,tsx}": "eslint",
  // Recusa o lock gerado por um npm de outra versão major que a do packageManager (#240).
  "package-lock.json": "node scripts/check-package-manager.mjs",
  // Só quando o commit mexe em código de src/ ou no próprio linter (cerca de 5 s; #205).
  "{src/**/*,scripts/lint-architecture.{cjs,mjs},tsconfig.json}": () => "npm run lint:architecture",
};
