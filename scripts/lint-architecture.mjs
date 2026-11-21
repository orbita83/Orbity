import path from "node:path";
import { fileURLToPath } from "node:url";
import archLinter from "./lint-architecture.cjs";

const { lintArchitecture, formatViolations } = archLinter;

export { lintArchitecture, formatViolations };

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const result = lintArchitecture();
  if (!result.ok) {
    console.error(
      `\nLinter de arquitetura encontrou ${result.violations.length} problemas em ${result.checkedFiles} arquivos verificados.\n`,
    );
    console.error(formatViolations(result.violations));
    console.error("");
    process.exitCode = 1;
  } else {
    console.log(`Linter de arquitetura verificou ${result.checkedFiles} arquivos sem apontar violações.`);
  }
}
