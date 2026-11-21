// Automatic Pull Request labels (issue #186). Rules live in .github/pr-labels.json.
const AUTOMATION_LOGIN = "github-actions[bot]";
const TITLE_TYPE = /^([a-z]+)(?:\([^)]*\))?!?:/;
const BRANCH_TYPE = /^([a-z]+)\//;

function globToRegExp(glob) {
  let pattern = "";
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    if (char === "*" && glob[index + 1] === "*") {
      if (glob[index + 2] === "/") {
        pattern += "(?:.*/)?";
        index += 2;
      } else {
        pattern += ".*";
        index += 1;
      }
    } else if (char === "*") {
      pattern += "[^/]*";
    } else if (char === "?") {
      pattern += "[^/]";
    } else {
      pattern += char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${pattern}$`);
}

function matchesAny(file, globs = []) {
  return globs.some((glob) => globToRegExp(glob).test(file));
}

function detectType(title, branch, types) {
  const fromTitle = TITLE_TYPE.exec(title ?? "")?.[1];
  if (fromTitle && types[fromTitle]) {
    return { type: fromTitle, source: "título" };
  }
  const fromBranch = BRANCH_TYPE.exec(branch ?? "")?.[1];
  if (fromBranch && types[fromBranch]) {
    return { type: fromBranch, source: "branch" };
  }
  return null;
}

function managedLabels(config) {
  return new Set([
    ...Object.values(config.types),
    ...config.areas.map((area) => area.label),
    ...Object.values(config.bases ?? {}).map((base) => base.label),
  ]);
}

/**
 * Computes the labels a Pull Request should have, each with the rule that produced it.
 * @returns {{ label: string, reason: string }[]}
 */
function computeLabels({ title, branch, base, files }, config) {
  const result = new Map();
  const add = (label, reason) => {
    if (!result.has(label)) {
      result.set(label, reason);
    }
  };

  const detected = detectType(title, branch, config.types);
  if (detected) {
    add(config.types[detected.type], `tipo "${detected.type}" pelo ${detected.source}`);
  }

  // Release PRs aggregate every area, so their area labels carry no signal.
  const baseRule = config.bases?.[base];
  const areas = baseRule?.skipAreas ? [] : config.areas;
  const relevant = files.filter((file) => !matchesAny(file, config.ignoredFiles));
  for (const area of areas) {
    if (detected && area.unlessType?.includes(detected.type)) {
      continue;
    }
    const matched = relevant.filter((file) => matchesAny(file, area.files) && !matchesAny(file, area.exclude));
    if (matched.length === 0) {
      continue;
    }
    if (area.requiresOther) {
      const others = relevant.filter((file) => !matched.includes(file) && matchesAny(file, area.requiresOther));
      if (others.length === 0) {
        continue;
      }
    }
    add(area.label, `área por arquivo alterado (ex.: ${matched[0]})`);
  }

  if (baseRule) {
    add(baseRule.label, `destino "${base}"`);
  }

  return [...result].map(([label, reason]) => ({ label, reason }));
}

/**
 * Reads the label history of a Pull Request: which labels the automation owns (its own
 * "labeled" event is the latest one) and which a person removed (latest event is a human "unlabeled").
 */
function labelHistory(events, automationLogin = AUTOMATION_LOGIN) {
  const latest = new Map();
  for (const event of events) {
    if ((event.event === "labeled" || event.event === "unlabeled") && event.label?.name) {
      latest.set(event.label.name, { event: event.event, actor: event.actor?.login });
    }
  }
  const owned = new Set();
  const removedByPerson = new Set();
  for (const [label, last] of latest) {
    if (last.event === "labeled" && last.actor === automationLogin) {
      owned.add(label);
    }
    if (last.event === "unlabeled" && last.actor !== automationLogin) {
      removedByPerson.add(label);
    }
  }
  return { owned, removedByPerson };
}

/**
 * Decides which labels to add and remove. Only labels the automation applied itself are removed,
 * and a label a person removed is not added back.
 */
function planLabelChanges({ current, desired, owned, removedByPerson, managed }) {
  const currentSet = new Set(current);
  const desiredSet = new Set(desired);
  const add = desired.filter((label) => !currentSet.has(label) && !removedByPerson.has(label));
  const remove = current.filter((label) => managed.has(label) && owned.has(label) && !desiredSet.has(label));
  return { add, remove };
}

async function syncPullRequestLabels({ github, context, core, config }) {
  const pullRequest = context.payload.pull_request;
  const { owner, repo } = context.repo;
  const issueNumber = pullRequest.number;

  const files = await github.paginate(github.rest.pulls.listFiles, {
    owner,
    repo,
    pull_number: issueNumber,
    per_page: 100,
  });
  const computed = computeLabels(
    {
      title: pullRequest.title,
      branch: pullRequest.head.ref,
      base: pullRequest.base.ref,
      files: files.map((file) => file.filename),
    },
    config,
  );
  for (const { label, reason } of computed) {
    core.info(`${label}: ${reason}`);
  }

  const events = await github.paginate(github.rest.issues.listEvents, {
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  });
  const { owned, removedByPerson } = labelHistory(events);
  const current = (pullRequest.labels ?? []).map((label) => label.name);
  const { add, remove } = planLabelChanges({
    current,
    desired: computed.map(({ label }) => label),
    owned,
    removedByPerson,
    managed: managedLabels(config),
  });

  for (const label of computed.map((item) => item.label).filter((label) => removedByPerson.has(label))) {
    core.info(`${label}: não reaplicada porque foi removida manualmente.`);
  }
  if (add.length > 0) {
    await github.rest.issues.addLabels({ owner, repo, issue_number: issueNumber, labels: add });
    core.info(`Adicionadas: ${add.join(", ")}`);
  }
  for (const label of remove) {
    await github.rest.issues.removeLabel({ owner, repo, issue_number: issueNumber, name: label });
    core.info(`Removida (deixou de valer): ${label}`);
  }
  if (add.length === 0 && remove.length === 0) {
    core.info("Nenhuma alteração de labels necessária.");
  }
}

module.exports = {
  AUTOMATION_LOGIN,
  computeLabels,
  globToRegExp,
  labelHistory,
  managedLabels,
  planLabelChanges,
  syncPullRequestLabels,
};
