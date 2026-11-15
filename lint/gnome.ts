// ================================
// Name: 'a-gnome-extension-template'/lint/gnome.ts
// Author: 'a-matthew'/Mateusz A.
// Year: 2026
// Comments: A `deno lint` plugin with rules from the GNOME Shell extension review guidelines.
// ================================

// https://docs.deno.com/runtime/reference/lint_plugins/
// https://gjs.guide/extensions/review-guidelines/review-guidelines.html

// Auto-generated: Libraries that conflict with GTK, so they are only allowed in the GNOME Shell process.
const modulesShell = [
  "gi://Clutter",
  "gi://Meta",
  "gi://Mtk",
  "gi://Shell",
  "gi://St",
];
// Auto-generated: Libraries that conflict with Clutter, so they are only allowed in the preferences process.
const modulesPreferences = ["gi://Adw", "gi://Gdk", "gi://Gtk"];

type ProcessName = "shell" | "preferences" | "shared";

// Auto-generated: `prefs.ts` and files in a `prefs/` folder run in the preferences process, files in a `shared/` folder in both.
function processNameDetect(fileName: string): ProcessName {
  if (/(^|\/)shared\//.test(fileName)) return "shared";
  if (/(^|\/)prefs(\.ts$|\/)/.test(fileName)) return "preferences";
  return "shell";
}

function moduleNameMatch(source: string, modules: string[]): boolean {
  return modules.some((module) =>
    source === module || source.startsWith(`${module}?`)
  );
}

const plugin: Deno.lint.Plugin = {
  name: "gnome",
  rules: {
    "process-imports": {
      create(context): Deno.lint.LintVisitor {
        const processCurrent = processNameDetect(context.filename);
        return {
          ImportDeclaration(node): void {
            const source = node.source.value;
            const forbiddenShell = processCurrent !== "shell" &&
              moduleNameMatch(source, modulesShell);
            const forbiddenPreferences = processCurrent !== "preferences" &&
              moduleNameMatch(source, modulesPreferences);
            if (forbiddenShell || forbiddenPreferences) {
              context.report({
                node,
                message:
                  `"${source}" must not be imported in a ${processCurrent} module.`,
                hint: forbiddenShell
                  ? "Clutter, Meta, Mtk, Shell and St are only allowed in the GNOME Shell process (extension.ts)."
                  : "Adw, Gdk and Gtk are only allowed in the preferences process (prefs.ts).",
              });
            }
          },
        };
      },
    },
    "disable-sync": {
      create(context): Deno.lint.LintVisitor {
        return {
          MethodDefinition(node): void {
            if (
              node.key.type === "Identifier" && node.key.name === "disable" &&
              node.value.async
            ) {
              context.report({
                node,
                message: "disable() must not be async.",
                hint:
                  "GNOME Shell 51 throws an error for an async disable(). Start async work in enable() and cancel it in disable().",
              });
            }
          },
        };
      },
    },
    "no-legacy-imports": {
      create(context): Deno.lint.LintVisitor {
        return {
          MemberExpression(node): void {
            if (
              node.object.type === "Identifier" &&
              node.object.name === "imports"
            ) {
              context.report({
                node,
                message: "The legacy `imports` object is not available.",
                hint:
                  'Since GNOME Shell 45, use ES modules, e.g. `import GLib from "gi://GLib"`.',
              });
            }
          },
        };
      },
    },
  },
};

export default plugin;
