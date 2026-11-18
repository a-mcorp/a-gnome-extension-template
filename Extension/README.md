<sup>This project has been generated using ['A-GNOME-Extension-Template' (AGET)](https://github.com/a-matthew/a-gnome-extension-template).</sup>

## Metadata
Most information regarding GNOME Shell extensions can be found in the GJS project's [Extensions guide](https://gjs.guide/extensions/).
- for the files of an extension refer to: [Anatomy of an Extension](https://gjs.guide/extensions/overview/anatomy.html)
- for the publishing rules refer to: [Review Guidelines](https://gjs.guide/extensions/review-guidelines/review-guidelines.html)
- for the changes between GNOME versions refer to: [Porting Guides](https://gjs.guide/extensions/upgrading/gnome-shell-51.html)
- for the API of the GNOME libraries (`gi://`) refer to: [GJS API documentation](https://gjs-docs.gnome.org/)
- for the GNOME Shell modules (`resource:///org/gnome/shell/...`) refer to: [GNOME Shell source code](https://gitlab.gnome.org/GNOME/gnome-shell/-/tree/main/js)

## Setup
### Dependencies
  - GNOME Shell: __{shell-version}__ (Fedora 45: GNOME 51)
  - Type definitions: [__@girs/gnome-shell__](https://www.npmjs.com/package/@girs/gnome-shell), with the same major version as the newest `shell-version`
  - Packer: [__gnome-extensions__](https://gjs.guide/extensions/development/creating.html) (part of GNOME Shell)

> 🚧
> GNOME Shell runs JavaScript, not TypeScript. The extension is written in TypeScript in `src/`, checked against the `@girs` types, and transpiled into readable JavaScript in `dist/`.

### Extension anatomy
An extension is a folder named after its UUID, in `~/.local/share/gnome-shell/extensions/{extension-uuid}/` (per user) or `/usr/share/gnome-shell/extensions/` (system-wide). `deno task build` creates that folder in `dist/`:
- extension.js (required)
  - transpiled from `src/extension.ts`; runs inside the GNOME Shell process
- prefs.js
  - transpiled from `src/prefs.ts`; runs in a separate preferences process, opened from the Extensions app
- metadata.json (required, static file)
  - the identity and the supported GNOME versions of the extension
- schemas/org.gnome.shell.extensions.{extension-id}.gschema.xml (static file)
  - the settings (GSettings keys) of the extension; compiled automatically on installation
- stylesheet.css (static file)
  - the styles of the extension's St widgets
- locale/ (optional)
  - the compiled translations, added by `gnome-extensions pack --podir=po`

The static files are kept in `Extension/Recipe` and copied as they are.

#### metadata.json
- `uuid`: `{extension-id}@{extension-namespace}`, e.g. `clipboard-history@username.github.io`
  - letters, numbers, `.`, `_` and `-` only; the namespace must be a domain or an account you control, never `gnome.org`
  - must match the installed folder name
- `name`, `description`: shown in the Extensions app and on extensions.gnome.org
- `shell-version`: the major GNOME versions the extension is tested on, e.g. `["50", "51"]`; never future versions
- `url`: the repository, where users report problems; required for extensions.gnome.org
- `settings-schema`: the schema ID used by `getSettings()`
- `gettext-domain`: the translation domain used by `gettext()` (usually the UUID)
- `version-name`: the version shown to users, e.g. `1.2`; do not set `version`, which extensions.gnome.org sets
- `session-modes`: only for extensions that must keep running on the lock screen; leave it out otherwise

### Two processes
The extension and its preferences run in different processes, with different libraries:
- `src/extension.ts`: GNOME Shell process; uses `Clutter`, `Meta`, `Mtk`, `Shell`, `St` and the GNOME Shell modules (`Main`, `PanelMenu`, `QuickSettings`, …)
- `src/prefs.ts`: preferences process; uses `Gtk`, `Adw` (libadwaita) and `Gdk`
- both: `GLib`, `Gio`, `GObject`

Importing GTK libraries into the GNOME Shell process (or the other way round) breaks GNOME Shell, so `deno lint` rejects it (rule `gnome/process-imports`). Helper modules for the preferences go into `src/prefs/`, and modules used by both processes into `src/shared/`.

### Lifecycle
GNOME Shell loads the extension once, but enables and disables it many times: on login, on every screen lock and unlock, and when it is switched on and off in the Extensions app.
- `constructor()`: only static data; never create widgets, connect signals or add timers here
- `enable()`: create widgets, connect signals, add timers (`GLib.timeout_add`) and change GNOME Shell
- `disable()`: undo **everything** done in `enable()`: destroy widgets, disconnect signals, remove timers, and set the fields back to `null`
  - it must not throw an error, otherwise GNOME Shell marks the extension as failed until the next login
  - it must not be `async` (GNOME Shell 51 throws an error, rule `gnome/disable-sync`)

The example in `src/extension.ts` follows this pattern: it adds a top bar icon and connects a settings signal in `enable()`, and removes both in `disable()`.

### TypeScript to JavaScript
`deno task transpile` runs the TypeScript compiler (`tsc`) through Deno, with the settings in `tsconfig.json`:
- the `gi://` and `resource://` imports are kept as they are, and the output uses ES modules, as GNOME Shell expects
- type-only imports must use `import type` (`verbatimModuleSyntax`), e.g. `import type Gio from "gi://Gio"`, so they do not end up in the JavaScript
- comments are removed (`removeComments`), and `deno task build` formats the output with `deno fmt`, so the reviewers get clean, readable JavaScript
- every `.ts` file in `src/` becomes a `.js` file in `dist/`, in the same folder structure

`deno check` cannot resolve the `gi://` imports, so the type check uses `tsc` as well (`deno task typecheck`). The TypeScript compiler is pinned to 6.0, the last version written in JavaScript, which runs inside Deno.

### Settings
- Define the keys in the schema file in `Extension/Recipe/schemas/`. The schema ID must start with `org.gnome.shell.extensions.`, its path with `/org/gnome/shell/extensions/`, and the file name must be `{schema-id}.gschema.xml`.
- Read them with `this.getSettings()` in both processes, and react to changes with `settings.connect("changed::{key}", …)`.
- In the preferences, `settings.bind()` connects a key to a widget, so changes are saved and applied immediately.
- Inspect them in a terminal: `gsettings --schemadir ~/.local/share/gnome-shell/extensions/{extension-uuid}/schemas list-recursively org.gnome.shell.extensions.{extension-id}`

### Translations
- Mark the texts with `_("…")` (`gettext`); the `gettext-domain` in `metadata.json` loads the translations automatically.
- Create the template from the transpiled code: `xgettext --from-code=UTF-8 --output=po/{extension-uuid}.pot dist/*.js`
- Translate it into `po/{language}.po` files, and pack them with `gnome-extensions pack dist --podir=../po`.
- Do not ship the `.po` and `.pot` files themselves; `gnome-extensions pack` compiles them into `locale/`.

### Renaming the extension
The template builds as the example extension `template@example.com`. To start a new extension, replace:
1. in `Extension/Recipe/metadata.json`: `uuid`, `name`, `description`, `shell-version`, `url`, `settings-schema` and `gettext-domain`
2. the schema file name, and the `id` and `path` inside it
3. the class names (`TemplateExtension`, `TemplatePreferences`), the `_("Template")` label and the `template-indicator` style class
4. the `@girs/gnome-shell` version in `deno.jsonc`, to match the newest `shell-version`, and run `deno install`

## Usage
### Build and install
  1. `deno task build`
  2. `deno task pack`
  3. `deno task install`
  4. log out and back in (GNOME Shell on Wayland cannot reload extensions while running)
  5. `gnome-extensions enable {extension-uuid}`, and `gnome-extensions prefs {extension-uuid}` for the preferences

For extra JavaScript modules (other than `extension.js` and `prefs.js`), add them to the `pack` task with `--extra-source`, e.g. `--extra-source=shared`.

### Testing
  - `deno task devkit` starts a nested GNOME Shell in a window, with its own session, so the extension can be tested without logging out (GNOME 49 and later, needs `mutter-devkit`). Install and enable the extension first.
  - The preferences process can be restarted any time: close the window and run `gnome-extensions prefs {extension-uuid}` again.
  - Test the lock screen: lock and unlock the session once, since this calls `disable()` and `enable()`.

> 🚧
> The nested GNOME Shell is not fully isolated from the system and shares the user's settings. Some hardware, such as sensors, is not available inside it.

### Debugging
  - `deno task logs` follows the GNOME Shell log, where the extension's `console.log()`, `console.warn()` and `console.error()` messages and errors appear.
  - `SHELL_DEBUG=all` (e.g. in front of the `devkit` command) prints the JavaScript stack for warnings and crashes.
  - Looking Glass (`Alt+F2`, then `lg`) is GNOME Shell's built-in inspector: a JavaScript console inside the running Shell, a widget picker, and an "Extensions" tab with the error of a failed extension.
  - `gnome-extensions info {extension-uuid}` shows the state of the extension (e.g. `ACTIVE`, `ERROR`).

### Publishing
Extensions are published on [extensions.gnome.org](https://extensions.gnome.org/upload/), where every version is reviewed by hand. Upload the zip from `deno task pack`. The most important review rules:
- follow the [lifecycle](#lifecycle) rules: nothing in the constructor, a complete cleanup in `disable()`
- the code must be readable JavaScript: no minified or obfuscated code, and TypeScript transpiled to well-formatted JavaScript
- no excessive logging; use `console.debug()` only during development
- no binaries, no build scripts and no unused files in the zip
- the licence must be compatible with GPL-2.0-or-later (this template uses MIT-0, which is compatible; extensions created from it usually use GPL-3.0-or-later)
- the developer must be able to explain the code: submissions that look AI-generated (unnecessary code, invented APIs, comments written as prompts) are rejected
- clipboard access must be declared in the description, and no telemetry is allowed

## Example
### CD Build
{...}
