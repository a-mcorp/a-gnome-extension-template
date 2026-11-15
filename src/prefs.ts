import Adw from "gi://Adw";
import Gio from "gi://Gio";
import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

// Auto-generated: Runs in a separate preferences process (GTK 4 and libadwaita), opened from the Extensions app.
export default class TemplatePreferences extends ExtensionPreferences {
  override fillPreferencesWindow(
    window: Adw.PreferencesWindow,
  ): Promise<void> {
    const settings = this.getSettings();

    const pageGeneral = new Adw.PreferencesPage({
      title: _("General"),
      iconName: "preferences-system-symbolic",
    });
    const groupAppearance = new Adw.PreferencesGroup({
      title: _("Appearance"),
    });
    const rowIndicator = new Adw.SwitchRow({
      title: _("Show indicator"),
      subtitle: _("Show the icon in the top bar"),
    });

    groupAppearance.add(rowIndicator);
    pageGeneral.add(groupAppearance);
    window.add(pageGeneral);

    // Auto-generated: Binds the switch to the GSettings key, so changes are saved and applied immediately.
    settings.bind(
      "show-indicator",
      rowIndicator,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    return Promise.resolve();
  }
}
