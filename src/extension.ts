import type Gio from "gi://Gio";
import St from "gi://St";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";

// Auto-generated: Runs inside the GNOME Shell process. Create everything in enable() and undo all of it in disable().
export default class TemplateExtension extends Extension {
  private indicator: PanelMenu.Button | null = null;
  private settings: Gio.Settings | null = null;
  private settingsHandlerId: number | null = null;

  override enable(): void {
    this.settings = this.getSettings();

    this.indicator = new PanelMenu.Button(0.0, _("Template"), false);
    this.indicator.add_style_class_name("template-indicator");
    this.indicator.add_child(
      new St.Icon({
        iconName: "face-smile-symbolic",
        styleClass: "system-status-icon",
      }),
    );
    Main.panel.addToStatusArea(this.uuid, this.indicator);

    this.settingsHandlerId = this.settings.connect(
      "changed::show-indicator",
      () => this.indicatorVisibilityUpdate(),
    );
    this.indicatorVisibilityUpdate();
  }

  override disable(): void {
    if (this.settings && this.settingsHandlerId !== null) {
      this.settings.disconnect(this.settingsHandlerId);
    }
    this.settingsHandlerId = null;
    this.settings = null;

    this.indicator?.destroy();
    this.indicator = null;
  }

  private indicatorVisibilityUpdate(): void {
    if (this.indicator && this.settings) {
      this.indicator.visible = this.settings.get_boolean("show-indicator");
    }
  }
}
