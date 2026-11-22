const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const LAYERS = {
  app: ["view"],
  view: ["view", "viewmodel"],
  viewmodel: ["viewmodel"],
  usecase: ["model"],
  model: ["model"],
  infra: ["infra", "model"],
  di: ["di", "infra", "model", "usecase"],
};

const PRESENTATION_PACKAGES = [
  "react", "react-native", "react-native-safe-area-context", "react-native-svg",
  "react-native-reanimated", "react-native-gesture-handler", "@expo/ui",
  "expo-font", "expo-image", "expo-glass-effect", "expo-symbols",
];
const LAYOUT_PACKAGES = ["react", "expo-router", "expo-status-bar", "expo-system-ui"];
const VIEWMODEL_PACKAGES = ["react", "react-native", "expo-router"];
const SQLITE_EXECUTOR = "src/infra/database/expoSqlExecutor.ts";
const NOTIFICATION_SERVICE = "src/infra/services/expoNotificationService.ts";
const SUPPORT_SUFFIX = /\.(?:test|spec|stories|contract|fixture|factory)$/;
const CODE_EXTENSION = /\.[cm]?[jt]sx?$/;
const CAMEL_CASE = /^[a-z][a-zA-Z0-9]*$/;
const PASCAL_CASE = /^[A-Z][a-zA-Z0-9]*$/;
const KEBAB_CASE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const ROUTE_NAME = /^(?:\[(?:\.\.\.)?[a-zA-Z][a-zA-Z0-9]*\]|\+not-found|_layout)$/;
const VIEWMODEL_NAME = /^use([A-Z][a-zA-Z0-9]*)ViewModel$/;
const PORT_DIRECTORY = /^src\/model\/(?:datasources|services)\//;
const USECASE_INTERFACE = /^I[A-Z][a-zA-Z0-9]*UseCases?$/;

function withoutExtension(file) {
  return file.replace(CODE_EXTENSION, "");
}

function isSupportFile(file) {
  return file.includes("/__fixtures__/") || SUPPORT_SUFFIX.test(withoutExtension(file));
}

function projectPath(rootDir, file) {
  return path.relative(rootDir, file).split(path.sep).join("/");
}

function collectFiles(directory, rootDir, report) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(directory, entry.name);
    const file = projectPath(rootDir, fullPath);
    if (entry.isDirectory()) {
      const layer = file.split("/")[1];
      if (!Object.hasOwn(LAYERS, layer)) {
        report("ARCH-007", file, "Diretório fora das camadas de src/.");
      } else if (entry.name === "__tests__") {
        report("ARCH-004", file, "Coloque os testes junto aos módulos que eles verificam.");
      } else {
        files.push(...collectFiles(fullPath, rootDir, report));
      }
    } else if (entry.isFile() && CODE_EXTENSION.test(file)) {
      if (file.split("/").length < 3) {
        report("ARCH-007", file, "Arquivo de código deve ficar dentro de uma camada de src/.");
      } else {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function walkAst(node, visit) {
  visit(node);
  ts.forEachChild(node, (child) => walkAst(child, visit));
}

function dependencyOf(node) {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
    return node.moduleSpecifier;
  }
  if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
    return node.moduleReference.expression;
  }
  if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
    return node.argument.literal;
  }
  if (ts.isCallExpression(node)) {
    const callee = node.expression;
    if (callee.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(callee) && callee.text === "require")) {
      return node.arguments[0] ?? callee;
    }
  }
}

function namedBindings(node) {
  if (ts.isImportDeclaration(node)) {
    const clause = node.importClause;
    if (clause && !clause.name && clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      return clause.namedBindings.elements;
    }
  }
  if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
    return node.exportClause.elements;
  }
  return [];
}

function isTypeOnly(node) {
  if (ts.isImportTypeNode(node) || node.isTypeOnly || node.importClause?.isTypeOnly) return true;
  const bindings = namedBindings(node);
  return bindings.length > 0 && bindings.every((binding) => binding.isTypeOnly);
}

function originalSymbol(symbol, checker) {
  return symbol && (symbol.flags & ts.SymbolFlags.Alias) ? checker.getAliasedSymbol(symbol) : symbol;
}

function importsUseCaseContracts(node, checker) {
  if (!isTypeOnly(node)) return false;
  if (ts.isImportTypeNode(node)) {
    const symbol = node.qualifier && originalSymbol(checker.getSymbolAtLocation(node.qualifier), checker);
    return isUseCaseContract(symbol);
  }
  const bindings = namedBindings(node);
  return bindings.length > 0 && bindings.every((binding) => {
    const symbol = checker.getSymbolAtLocation(binding.name);
    return isUseCaseContract(originalSymbol(symbol, checker));
  });
}

function isUseCaseContract(symbol) {
  return Boolean(symbol && (symbol.flags & ts.SymbolFlags.Interface) && USECASE_INTERFACE.test(symbol.name));
}

function resolveTarget(specifier, importer, rootDir, options, cache) {
  const resolved = ts.resolveModuleName(specifier, importer, options, ts.sys, cache).resolvedModule;
  if (resolved && !resolved.isExternalLibraryImport) {
    return { file: projectPath(rootDir, resolved.resolvedFileName) };
  }
  if (specifier.startsWith(".") || path.isAbsolute(specifier)) {
    return { file: projectPath(rootDir, path.resolve(path.dirname(importer), specifier)) };
  }
  // O Metro também resolve recursos estáticos, que não têm módulo TypeScript.
  if (specifier.startsWith("@/assets/")) {
    return { file: path.posix.normalize("assets/" + specifier.slice("@/assets/".length)) };
  }
  if (specifier.startsWith("@/")) {
    return { file: path.posix.normalize("src/" + specifier.slice(2)) };
  }
  return { packageName: specifier.split("/").slice(0, specifier.startsWith("@") ? 2 : 1).join("/") };
}

function checkPackage(layer, file, pkg, node) {
  if (pkg === "better-sqlite3" || (pkg === "expo-sqlite" && file !== SQLITE_EXECUTOR)) {
    return "Restrição do ADR-0001. Só o executor do Expo importa expo-sqlite e better-sqlite3 é exclusivo de testes.";
  }
  if (pkg === "expo-notifications" && file !== NOTIFICATION_SERVICE) {
    return "Restrição do ADR-0002. Só o serviço de notificações da infraestrutura importa expo-notifications.";
  }
  const allowed = {
    app: LAYOUT_PACKAGES,
    view: PRESENTATION_PACKAGES,
    viewmodel: VIEWMODEL_PACKAGES,
    model: [],
    usecase: [],
  }[layer];

  if (layer === "view" && pkg === "expo-router" &&
      file === "src/view/components/MainTabBar.tsx" && isTypeOnly(node)) {
    return;
  }
  if (allowed && !allowed.includes(pkg)) {
    return `Pacote "${pkg}" fora das dependências permitidas em "${layer}/".`;
  }
  if (layer === "infra" && pkg === "react-native" && file.startsWith("src/infra/services/")) {
    return;
  }
  if ((layer === "di" || layer === "infra") &&
      (VIEWMODEL_PACKAGES.includes(pkg) || pkg === "react-dom" ||
       pkg.startsWith("@storybook/") || pkg.startsWith("@testing-library/"))) {
    return `Pacote de apresentação ou teste "${pkg}" em "${layer}/".`;
  }
}

function checkDependency({ node, specifier, target, layer, file, support, checker, report }) {
  const issue = (id, message) => report(id, message + ` Dependência: "${specifier.text}".`, specifier);
  if (support) {
    if (["model", "usecase", "infra", "di"].includes(layer) &&
        !(layer === "infra" && target.packageName === "react-native" && file.startsWith("src/infra/services/")) &&
        (/^src\/(?:app|view|viewmodel)\//.test(target.file ?? "") ||
         VIEWMODEL_PACKAGES.includes(target.packageName) || target.packageName === "react-dom" ||
         target.packageName?.startsWith("@testing-library/"))) {
      issue("ARCH-004", "Testes das camadas internas devem ser independentes da apresentação.");
    }
    return;
  }

  if (target.packageName) {
    const problem = checkPackage(layer, file, target.packageName, node);
    if (problem) issue("ARCH-001", problem);
    return;
  }

  if (isSupportFile(target.file)) {
    issue("ARCH-004", "Código de produção não pode depender de testes, histórias ou fixtures.");
    return;
  }
  if (layer === "view" && /^assets\/.+\.(?:avif|gif|jpe?g|png|svg|webp|otf|ttf|woff2?)$/i.test(target.file)) return;

  const [, targetLayer] = target.file.split("/");
  const targetPath = withoutExtension(target.file);
  if (layer === "view" && targetPath.startsWith("src/model/entities/") && isTypeOnly(node)) return;
  if (layer === "viewmodel") {
    if (targetPath.startsWith("src/model/entities/") || targetPath === "src/model/errors") return;
    if (targetPath === "src/di/container") {
      const bindings = namedBindings(node);
      if (ts.isImportDeclaration(node) && bindings.length > 0 &&
          bindings.every((binding) => ["container", "resolveUseCase"].includes((binding.propertyName ?? binding.name).text))) {
        return;
      }
      issue("ARCH-002", "A ViewModel só pode importar container e resolveUseCase da composição.");
      return;
    }
  }

  if (targetLayer === "usecase" && targetPath.startsWith("src/") && ["viewmodel", "usecase"].includes(layer)) {
    if (!importsUseCaseContracts(node, checker)) {
      issue("ARCH-002", "Importe apenas interfaces públicas I*UseCase(s) por tipo.");
    }
    return;
  }
  if (!targetPath.startsWith("src/") || !LAYERS[layer].includes(targetLayer)) {
    issue("ARCH-001", `Dependência fora dos limites de "${layer}/".`);
  }
}

function validFileName(file, layer) {
  const name = path.basename(withoutExtension(file)).replace(SUPPORT_SUFFIX, "");
  if (layer === "app") return file.endsWith(".tsx") && (KEBAB_CASE.test(name) || ROUTE_NAME.test(name));
  if (file.startsWith("src/view/components/")) return file.endsWith(".tsx") && PASCAL_CASE.test(name);
  if (layer === "view" && file.endsWith(".tsx")) return KEBAB_CASE.test(name) || ROUTE_NAME.test(name);
  if (layer === "viewmodel") return file.endsWith(".ts") && (CAMEL_CASE.test(name) || PASCAL_CASE.test(name));
  return file.endsWith(".ts") && CAMEL_CASE.test(name);
}

function checkContractFile(source, file, layer, report) {
  if (!["di", "infra", "model", "usecase"].includes(layer)) return;
  const base = path.basename(withoutExtension(file));
  const declarations = source.statements.filter((statement) =>
    !ts.isImportDeclaration(statement) && !ts.isTypeAliasDeclaration(statement));
  const contract = declarations.length === 1 && ts.isInterfaceDeclaration(declarations[0]) ? declarations[0] : undefined;
  const isPort = PORT_DIRECTORY.test(file);
  const isContract = /^i[A-Z]/.test(base);

  // Entidades podem ser representadas por interfaces estruturais, conforme a convenção do Orbity.
  if (!isPort && !isContract && (layer === "model" || !contract)) return;
  if (!contract || !/^I[A-Z]/.test(contract.name.text) || base !== "i" + contract.name.text.slice(1)) {
    report("ARCH-003", "Declare a interface I* correspondente e somente tipos auxiliares no arquivo de contrato i*.ts.");
  }
}

function moduleExports(source, checker) {
  const symbol = checker.getSymbolAtLocation(source);
  return symbol ? checker.getExportsOfModule(symbol) : [];
}

function checkViewModel(source, file, checker, report) {
  const name = path.basename(withoutExtension(file));
  const match = VIEWMODEL_NAME.exec(name);
  const exports = moduleExports(source, checker);
  const hooks = exports.filter((symbol) => VIEWMODEL_NAME.test(symbol.name));
  if (!match && hooks.length === 0) return;

  const hook = hooks.find((symbol) => symbol.name === name);
  if (!match || !hook) {
    report("ARCH-007", "Exporte o hook useNomeViewModel no arquivo useNomeViewModel.ts de mesmo nome.");
    return;
  }

  const [, screen] = match;
  const expectedTypes = [`${screen}State`, `${screen}Actions`].map((name) => {
    const symbol = originalSymbol(exports.find((item) => item.name === name), checker);
    return symbol && (symbol.flags & ts.SymbolFlags.Type) ? checker.getDeclaredTypeOfSymbol(symbol) : undefined;
  });
  const signatures = checker.getTypeOfSymbolAtLocation(hook, source).getCallSignatures();
  const hasTuple = signatures.length > 0 && signatures.every((signature) => {
    const result = signature.getReturnType();
    if (!checker.isTupleType(result)) return false;
    const items = checker.getTypeArguments(result);
    return items.length === 2 && expectedTypes.every((expected, index) =>
      expected && checker.isTypeAssignableTo(items[index], expected));
  });
  if (!hasTuple) {
    report("ARCH-008", `A ViewModel deve exportar ${screen}State e ${screen}Actions e retornar a tupla [state, actions].`);
  }
}

function checkRoute(source, file, rootDir, program, checker, resolve, report) {
  if (path.basename(file) === "_layout.tsx") return;
  const expected = file.replace(/^src\/app\//, "src/view/");
  const [first, second] = source.statements;
  let origin;
  if (source.statements.length === 2 && ts.isImportDeclaration(first) &&
      first.importClause?.name && !first.importClause.isTypeOnly && !first.importClause.namedBindings &&
      ts.isExportAssignment(second) && !second.isExportEquals && ts.isIdentifier(second.expression) &&
      first.importClause.name.text === second.expression.text) {
    origin = first.moduleSpecifier;
  } else if (source.statements.length === 1 && ts.isExportDeclaration(first) && !first.isTypeOnly) {
    const bindings = namedBindings(first);
    if (bindings.length === 1 && !bindings[0].isTypeOnly &&
        bindings[0].name.text === "default" && (bindings[0].propertyName ?? bindings[0].name).text === "default") {
      origin = first.moduleSpecifier;
    }
  }
  if (!origin || !ts.isStringLiteralLike(origin) || resolve(origin.text).file !== expected) {
    report("ARCH-006", `A rota deve apenas re-exportar como default a tela "${expected}".`);
    return;
  }
  const view = program.getSourceFile(path.join(rootDir, expected));
  const defaultExport = view && moduleExports(view, checker).find((symbol) => symbol.name === "default");
  const typeOnlyExport = defaultExport?.declarations?.some((declaration) =>
    ts.isExportSpecifier(declaration) && (declaration.isTypeOnly || declaration.parent.parent.isTypeOnly));
  if (!defaultExport || typeOnlyExport ||
      !(originalSymbol(defaultExport, checker).flags & ts.SymbolFlags.Value)) {
    report("ARCH-006", `A tela "${expected}" deve exportar o componente como default.`);
  }
}

function isContainerUseCases(identifier) {
  const parent = identifier.parent;
  return (ts.isPropertyAccessExpression(parent) && parent.expression === identifier && parent.name.text === "useCases") ||
    (ts.isElementAccessExpression(parent) && parent.expression === identifier &&
      ts.isStringLiteralLike(parent.argumentExpression) && parent.argumentExpression.text === "useCases");
}

function referencedSymbol(identifier, checker) {
  const parent = identifier.parent;
  if (ts.isShorthandPropertyAssignment(parent) && parent.name === identifier) {
    return checker.getShorthandAssignmentValueSymbol(parent);
  }
  return checker.getSymbolAtLocation(identifier);
}

function lintArchitecture({ rootDir = path.resolve(path.dirname(module.filename), "..") } = {}) {
  rootDir = path.resolve(rootDir);
  const srcDir = path.join(rootDir, "src");
  const violations = [];
  const add = (ruleId, file, message, line = 1, column = 1) => violations.push({ ruleId, file, line, column, message });
  let checkedFiles = 0;

  function result() {
    return { ok: violations.length === 0, violations, checkedFiles };
  }

  if (!fs.existsSync(srcDir)) {
    add("ARCH-000", "src", 'Diretório "src/" não encontrado.');
    return result();
  }

  const configPath = path.join(rootDir, "tsconfig.json");
  const config = fs.existsSync(configPath) ? ts.readConfigFile(configPath, ts.sys.readFile) : { config: {} };
  const parsed = ts.parseJsonConfigFileContent(config.config ?? {}, ts.sys, rootDir);
  const configError = config.error ?? parsed.errors.find((error) => error.code !== 18003);
  if (configError) {
    add("ARCH-000", "tsconfig.json", ts.flattenDiagnosticMessageText(configError.messageText, "\n"));
    return result();
  }

  const files = collectFiles(srcDir, rootDir, add);
  const options = { ...parsed.options, allowJs: true, noEmit: true };
  const program = ts.createProgram(files, options);
  const checker = program.getTypeChecker();
  const cache = ts.createModuleResolutionCache(rootDir, (name) => name, options);

  for (const filename of files) {
    const file = projectPath(rootDir, filename);
    const [, layer] = file.split("/");
    const source = program.getSourceFile(filename);
    const support = isSupportFile(file);
    const resolve = (specifier) => resolveTarget(specifier, filename, rootDir, options, cache);
    const report = (id, message, node) => {
      const position = node && source.getLineAndCharacterOfPosition(node.getStart(source));
      add(id, file, message, position && position.line + 1, position && position.character + 1);
    };
    checkedFiles += 1;

    if (layer === "app" && support) {
      report("ARCH-004", "Mantenha testes, histórias e fixtures fora das rotas do Expo Router.");
      continue;
    }
    if (!validFileName(file, layer)) {
      report("ARCH-007", "Nome ou extensão fora da convenção da camada em RULES.md.");
    }

    const containerBindings = new Set();
    if (!support && layer === "viewmodel") {
      for (const statement of source.statements) {
        if (ts.isImportDeclaration(statement) && ts.isStringLiteralLike(statement.moduleSpecifier) &&
            resolve(statement.moduleSpecifier.text).file?.replace(CODE_EXTENSION, "") === "src/di/container") {
          for (const binding of namedBindings(statement)) {
            if ((binding.propertyName ?? binding.name).text === "container") {
              containerBindings.add(checker.getSymbolAtLocation(binding.name));
            }
          }
        }
      }
    }

    walkAst(source, (node) => {
      const specifier = dependencyOf(node);
      if (specifier && ts.isStringLiteralLike(specifier)) {
        checkDependency({ node, specifier, target: resolve(specifier.text), layer, file, support, checker, report });
      } else if (specifier && !support) {
        report("ARCH-001", "Use um caminho de módulo literal para permitir a validação da dependência.", specifier);
      }

      if (!support && layer === "view" && ts.isTryStatement(node) && node.catchClause) {
        report("ARCH-005", "Trate erros na ViewModel, no Use Case ou na infraestrutura.", node);
      }
      if (containerBindings.size && ts.isIdentifier(node) && !ts.isImportSpecifier(node.parent) &&
          containerBindings.has(referencedSymbol(node, checker)) && !isContainerUseCases(node)) {
        report("ARCH-002", "A ViewModel só pode acessar container.useCases.", node);
      }
    });

    if (support) continue;
    checkContractFile(source, file, layer, report);
    if (layer === "viewmodel") checkViewModel(source, file, checker, report);
    if (layer === "app") checkRoute(source, file, rootDir, program, checker, resolve, report);
    if (file.startsWith("src/view/components/") && moduleExports(source, checker).some((symbol) => symbol.name === "default")) {
      report("ARCH-007", "Componentes reutilizáveis devem usar exportação nomeada.");
    }
  }

  return result();
}

function formatViolations(violations) {
  return violations
    .map(({ ruleId, file, line, column, message }) => `  [${ruleId}] ${file}:${line}:${column} — ${message}`)
    .join("\n");
}

module.exports = { lintArchitecture, formatViolations };
